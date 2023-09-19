import {
  Button,
  Container,
  Divider,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js'
import { useCallback, useMemo, useState } from 'react'

function App() {
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [jwt, setJwt] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const project = useMemo(() => {
    const searchParams = new URLSearchParams(document.location.search)
    const project = searchParams.get('project')
    return project
  }, [document.location.search])

  const projectCognitoUserPool = useMemo(() => {
    if (!project) return
    const UserPoolId = import.meta.env[
      'VITE_COGNITO_USER_POOL_ID_' + project.toUpperCase()
    ]
    const ClientId = import.meta.env[
      'VITE_COGNITO_CLIENT_ID_' + project.toUpperCase()
    ]
    return new CognitoUserPool({ UserPoolId, ClientId })
  }, [project])

  const login = useCallback(
    async (email?: string, password?: string) => {
      new Promise((resolve, reject) => {
        if (!projectCognitoUserPool || !email || !password) return
        setIsLoading(true)
        const user = new CognitoUser({
          Username: email,
          Pool: projectCognitoUserPool,
        })
        const authDetails = new AuthenticationDetails({
          Username: email,
          Password: password,
        })

        user.authenticateUser(authDetails, {
          onSuccess: async (data) => {
            setJwt(data.getAccessToken().getJwtToken())
            setIsLoading(false)
          },
          onFailure: (err) => {
            reject(err)
            setIsLoading(false)
          },
          newPasswordRequired: (data) => {
            resolve(data)
            setIsLoading(false)
          },
        })
      })
    },
    [projectCognitoUserPool]
  )

  return (
    <Container width="lg" py={5}>
      <Heading fontSize="lg" mb={4}>
        Project: {project}
      </Heading>

      <Input
        onChange={(e) => setEmail(e.target.value)}
        variant="filled"
        placeholder="メールアドレス"
        type="email"
        mb={4}
      />

      <Input
        onChange={(e) => setPassword(e.target.value)}
        variant="filled"
        placeholder="パスワード"
        type="password"
        mb={4}
      />

      <Button
        colorScheme="blue"
        width="full"
        onClick={() => {
          login(email, password)
        }}
        isLoading={isLoading}
      >
        JWTを取得
      </Button>

      <Divider my={5} />

      <Text fontWeight="bold">JWT</Text>
      <Text mt={2}>{jwt}</Text>
    </Container>
  )
}

export default App
