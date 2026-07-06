import { Amplify } from "aws-amplify"

let configured = false

/**
 * Configure Amplify once, on first import. Must run before any
 * aws-amplify/auth call (signIn, fetchAuthSession, signOut, etc).
 */
export function configureAmplify() {
  if (configured) return
  configured = true

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      },
    },
  })
}

configureAmplify()
