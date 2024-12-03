import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface VerificationEmailProps {
  url: string
  appName?: string
}

export default function VerificationEmail({
  url,
  appName = 'MedTrack',
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for {appName}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold text-gray-900 text-center mb-4">
              Welcome to {appName}
            </Heading>
            <Section>
              <Text className="text-gray-700 mb-4">
                Click the button below to verify your email address and complete
                your registration. This link will expire in 24 hours.
              </Text>
              <Button
                className="bg-primary text-white font-bold py-3 px-6 rounded"
                href={url}
              >
                Verify Email Address
              </Button>
              <Text className="text-gray-600 text-sm mt-4">
                If you didn't request this email, you can safely ignore it.
              </Text>
              <Text className="text-gray-500 text-xs mt-8">
                If the button above doesn't work, you can also click this link:{' '}
                <Link href={url} className="text-blue-600 underline">
                  {url}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 