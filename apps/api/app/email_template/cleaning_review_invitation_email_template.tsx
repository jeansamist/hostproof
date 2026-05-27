import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'
import React from 'react'

interface CleaningReviewInvitationEmailProps {
  employeeName: string
  reviewLink: string
  housingName?: string
  notes?: string | null
}

export function CleaningReviewInvitationEmailTemplate({
  employeeName,
  reviewLink,
  housingName,
  notes,
}: CleaningReviewInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You have a new cleaning review to complete.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans m-0 py-12">
          <Container className="max-w-[540px] mx-auto px-6">
            <Text className="text-base font-semibold m-0 mb-8" style={{ color: '#ea580c' }}>
              Clean Pilot
            </Text>

            <Heading className="text-2xl font-semibold text-gray-900 m-0 mb-4 leading-snug">
              Hi {employeeName}, you have a cleaning review to submit.
            </Heading>

            {housingName && (
              <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-2">
                <strong>Property:</strong> {housingName}
              </Text>
            )}

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-4">
              Please click the button below to record or upload your cleaning review video. It only
              takes a few minutes and helps ensure the property was properly cleaned.
            </Text>

            {notes && (
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  borderLeft: '3px solid #ea580c',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  marginBottom: '24px',
                }}
              >
                <Text className="text-gray-600 text-sm m-0 font-medium mb-1">
                  Notes from the manager:
                </Text>
                <Text className="text-gray-600 text-sm m-0">{notes}</Text>
              </div>
            )}

            <Button
              href={reviewLink}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '500',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Submit cleaning review
            </Button>

            <Text className="text-xs text-gray-400 m-0 mt-8 mb-1">
              Or copy and paste this URL into your browser:
            </Text>
            <Link href={reviewLink} className="text-xs break-all" style={{ color: '#ea580c' }}>
              {reviewLink}
            </Link>

            <Hr className="border-gray-100 my-10" />

            <Text className="text-xs text-gray-400 m-0">
              You received this email because you were assigned a cleaning review. If you believe
              this was sent in error, please ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
