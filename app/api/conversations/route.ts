import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import clientPromise from '@/lib/mongodb'

export const runtime = 'nodejs'

type StoredMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function isValidMessage(
  value: unknown
): value is StoredMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<StoredMessage>

  return (
    typeof message.id === 'string' &&
    (message.role === 'user' ||
      message.role === 'assistant') &&
    typeof message.content === 'string'
  )
}

/* Load conversation list */
export async function GET() {
  try {
    const session = await auth()
    const userEmail =
      session?.user?.email?.toLowerCase()

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        {
          status: 401,
        }
      )
    }

    const client = await clientPromise
    const database = client.db('vyron')

    const conversations = await database
      .collection('conversations')
      .find({
        userEmail,
      })
      .project({
        title: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({
        updatedAt: -1,
      })
      .toArray()

    return NextResponse.json({
      success: true,
      conversations: conversations.map(
        (conversation) => ({
          id: conversation._id.toString(),
          title:
            typeof conversation.title === 'string'
              ? conversation.title
              : 'New Chat',
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        })
      ),
    })
  } catch (error) {
    console.error(
      'Get conversations error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Could not load conversations.',
      },
      {
        status: 500,
      }
    )
  }
}

/* Create new conversation */
export async function POST(request: Request) {
  try {
    const session = await auth()
    const userEmail =
      session?.user?.email?.toLowerCase()

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        {
          status: 401,
        }
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON body.',
        },
        {
          status: 400,
        }
      )
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body.',
        },
        {
          status: 400,
        }
      )
    }

    const requestBody = body as {
      title?: unknown
      messages?: unknown
    }

    const title =
      typeof requestBody.title === 'string' &&
      requestBody.title.trim()
        ? requestBody.title.trim().slice(0, 100)
        : 'New Chat'

    const messages = Array.isArray(
      requestBody.messages
    )
      ? requestBody.messages.filter(isValidMessage)
      : []

    const now = new Date()

    const client = await clientPromise
    const database = client.db('vyron')

    const result = await database
      .collection('conversations')
      .insertOne({
        userEmail,
        title,
        messages,
        createdAt: now,
        updatedAt: now,
      })

    return NextResponse.json(
      {
        success: true,
        conversation: {
          id: result.insertedId.toString(),
          title,
          messages,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Create conversation error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message: 'Could not create conversation.',
      },
      {
        status: 500,
      }
    )
  }
}