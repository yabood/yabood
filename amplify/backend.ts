import { defineBackend } from '@aws-amplify/backend';
import { defineFunction } from '@aws-amplify/backend/function';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { secret } from '@aws-amplify/backend/secret';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

const jwtVerifyFunction = defineFunction({
  name: 'jwt-verify',
  entry: './functions/jwt-verify/handler.ts',
  timeoutSeconds: 30,
  environment: {
    // This will be injected from the secret
    AUTH_SECRET: secret('AUTH_SECRET'),
  },
});

const backend = defineBackend({
  auth,
  data,
  jwtVerifyFunction,
});

// Grant the function access to the UserProfile table
backend.data.resources.tables['UserProfile'].grantReadWriteData(
  backend.jwtVerifyFunction.resources.lambda
);

// Add function URL
const functionUrl = backend.jwtVerifyFunction.resources.lambda.addFunctionUrl({
  authType: 'NONE',
  cors: {
    allowOrigins: ['*'],
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

// Output the function URL for use in the frontend
backend.addOutput({
  custom: {
    jwtVerifyFunctionUrl: functionUrl.url,
  },
});
