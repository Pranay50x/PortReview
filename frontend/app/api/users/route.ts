import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'portreview';

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'developer' | 'recruiter';
  github_username?: string;
  created_at: Date;
  updated_at: Date;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    avatar_url?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    public_profile?: boolean;
  };
}

// GET /api/users - Get user by email or GitHub username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const github_username = searchParams.get('github_username');

    if (!email && !github_username) {
      return NextResponse.json(
        { error: 'Email or GitHub username is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users: Collection<User> = db.collection('users');

    let query = {};
    if (email) {
      query = { email };
    } else if (github_username) {
      query = { github_username };
    }

    const user = await users.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, user_type, github_username, profile, preferences } = body;

    if (!email || !name || !user_type) {
      return NextResponse.json(
        { error: 'Email, name, and user_type are required' },
        { status: 400 }
      );
    }

    if (!['developer', 'recruiter'].includes(user_type)) {
      return NextResponse.json(
        { error: 'user_type must be either "developer" or "recruiter"' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users: Collection<User> = db.collection('users');

    const now = new Date();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      // Update existing user
      const updateData: Partial<User> = {
        name,
        user_type,
        updated_at: now,
      };

      if (github_username) {
        updateData.github_username = github_username;
      }

      if (profile) {
        updateData.profile = { ...existingUser.profile, ...profile };
      }

      if (preferences) {
        updateData.preferences = { ...existingUser.preferences, ...preferences };
      }

      const result = await users.updateOne(
        { email },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      const updatedUser = await users.findOne({ email });
      return NextResponse.json(updatedUser);
    } else {
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        user_type,
        created_at: now,
        updated_at: now,
      };

      if (github_username) {
        newUser.github_username = github_username;
      }

      if (profile) {
        newUser.profile = profile;
      }

      if (preferences) {
        newUser.preferences = preferences;
      }

      const result = await users.insertOne(newUser);

      if (!result.insertedId) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      return NextResponse.json(newUser, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profile, preferences, github_username } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users: Collection<User> = db.collection('users');

    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<User> = {
      updated_at: new Date(),
    };

    if (github_username !== undefined) {
      updateData.github_username = github_username;
    }

    if (profile) {
      updateData.profile = { ...existingUser.profile, ...profile };
    }

    if (preferences) {
      updateData.preferences = { ...existingUser.preferences, ...preferences };
    }

    const result = await users.updateOne(
      { email },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 200 }
      );
    }

    const updatedUser = await users.findOne({ email });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const users: Collection<User> = db.collection('users');

    const result = await users.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
