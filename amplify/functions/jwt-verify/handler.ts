import jwt from 'jsonwebtoken';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const JWT_SECRET = process.env.AUTH_SECRET!;

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { token, action } = body;

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    if (action === 'verify') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const tableName = process.env.AMPLIFY_DATA_USERPROFILE_TABLE_NAME;

        const getCommand = new GetCommand({
          TableName: tableName,
          Key: {
            id: decoded.userId,
          },
        });

        const userData = await ddbDocClient.send(getCommand);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            valid: true,
            user: userData.Item || decoded,
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            valid: false,
            error: 'Invalid token',
          }),
        };
      }
    }

    if (action === 'saveProfile') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const { profile } = body;

        const tableName = process.env.AMPLIFY_DATA_USERPROFILE_TABLE_NAME;

        const userProfile = {
          id: decoded.userId,
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          provider: decoded.provider,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...profile,
        };

        const putCommand = new PutCommand({
          TableName: tableName,
          Item: userProfile,
        });

        await ddbDocClient.send(putCommand);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            profile: userProfile,
          }),
        };
      } catch (error: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to save profile',
            details: error.message,
          }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};
