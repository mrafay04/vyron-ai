import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { auth } from '@/auth'
import clientPromise from '@/lib/mongodb'

export const runtime = 'nodejs'

type StoredMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type RouteContext = {
  params: Promise<{
    conversationId: string
  }>
}

function isValidMessage(value: unknown): value is StoredMessage {
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

async function getUserEmail() {
  const session = await auth()

  return session?.user?.email?.toLowerCase() || null
}

/* Open one saved conversation */
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const userEmail = await getUserEmail()

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    const { conversationId } = await params

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid conversation ID.',
        },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const database = client.db('vyron')

    const conversation = await database
      .collection('conversations')
      .findOne({
        _id: new ObjectId(conversationId),
        userEmail,
      })

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message: 'Conversation not found.',
        },
        { status: 404 }
      )
    }

    const messages = Array.isArray(conversation.messages)
      ? conversation.messages.filter(isValidMessage)
      : []

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title:
          typeof conversation.title === 'string'
            ? conversation.title
            : 'New Chat',
        messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get conversation error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Could not load conversation.',
      },
      { status: 500 }
    )
  }
}

/* Update saved conversation */
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const userEmail = await getUserEmail()

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    const { conversationId } = await params

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid conversation ID.',
        },
        { status: 400 }
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
        { status: 400 }
      )
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body.',
        },
        { status: 400 }
      )
    }

    const requestBody = body as {
      title?: unknown
      messages?: unknown
    }

    const updateFields: {
      title?: string
      messages?: StoredMessage[]
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (
      typeof requestBody.title === 'string' &&
      requestBody.title.trim()
    ) {
      updateFields.title = requestBody.title
        .trim()
        .slice(0, 100)
    }

    if (Array.isArray(requestBody.messages)) {
      updateFields.messages =
        requestBody.messages.filter(isValidMessage)
    }

    if (
      updateFields.title === undefined &&
      updateFields.messages === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title or messages are required.',
        },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const database = client.db('vyron')

    const result = await database
      .collection('conversations')
      .updateOne(
        {
          _id: new ObjectId(conversationId),
          userEmail,
        },
        {
          $set: updateFields,
        }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Conversation not found.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation updated successfully.',
      updatedAt: updateFields.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Update conversation error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Could not update conversation.',
      },
      { status: 500 }
    )
  }
}
/* Delete saved conversation */
export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const userEmail = await getUserEmail()

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    const { conversationId } = await params

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid conversation ID.',
        },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const database = client.db('vyron')

    const result = await database
      .collection('conversations')
      .deleteOne({
        _id: new ObjectId(conversationId),
        userEmail,
      })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Conversation not found.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully.',
    })
  } catch (error) {
    console.error('Delete conversation error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Could not delete conversation.',
      },
      { status: 500 }
    )
  }
}