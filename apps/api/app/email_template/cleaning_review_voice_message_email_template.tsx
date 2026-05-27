import {
  Body,
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

interface CleaningReviewVoiceMessageEmailProps {
  ownerName: string
  employeeName: string
  housingName?: string
  reviewLink: string
}

export function CleaningReviewVoiceMessageEmailTemplate({
  ownerName,
  employeeName,
  housingName,
  reviewLink,
}: CleaningReviewVoiceMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{employeeName} left you a voice message about a cleaning review.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans m-0 py-12">
          <Container className="max-w-[540px] mx-auto px-6">
            <Text className="text-base font-semibold m-0 mb-8" style={{ color: '#ea580c' }}>
              Hostproof
            </Text>

            <Heading className="text-2xl font-semibold text-gray-900 m-0 mb-4 leading-snug">
              Hi {ownerName}, you have a new voice message.
            </Heading>

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-6">
              <strong>{employeeName}</strong> has left a voice message
              {housingName ? ` regarding the cleaning review at ${housingName}` : ' regarding a cleaning review'}.
              {' '}Open the review to listen to the recording.
            </Text>

            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Text className="text-blue-700 text-sm m-0">
                🎙️ A voice message is waiting for you on this review. Click the button below to listen.
              </Text>
            </div>

            <Link
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
              Listen to voice message
            </Link>

            <Hr className="border-gray-100 my-10" />

            <Text className="text-xs text-gray-400 m-0">
              You received this email because an employee left a voice message on one of your cleaning reviews.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
