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

interface CleaningReviewRequestNewReviewEmailProps {
  ownerName: string
  employeeName: string
  housingName?: string
  reviewLink: string
  toDoItems: string[]
}

export function CleaningReviewRequestNewReviewEmailTemplate({
  ownerName,
  employeeName,
  housingName,
  reviewLink,
  toDoItems,
}: CleaningReviewRequestNewReviewEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{employeeName} has completed all tasks and requests a new cleaning review.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans m-0 py-12">
          <Container className="max-w-[540px] mx-auto px-6">
            <Text className="text-base font-semibold m-0 mb-8" style={{ color: '#ea580c' }}>
              Clean Pilot
            </Text>

            <Heading className="text-2xl font-semibold text-gray-900 m-0 mb-4 leading-snug">
              Hi {ownerName}, a new review has been requested.
            </Heading>

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-4">
              <strong>{employeeName}</strong> has completed all the required tasks
              {housingName ? ` for ${housingName}` : ''} and is requesting a new cleaning review.
            </Text>

            {toDoItems.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                }}
              >
                <Text className="text-gray-700 text-sm m-0 font-medium mb-2">Completed tasks:</Text>
                {toDoItems.map((item, i) => (
                  <Text key={i} className="text-gray-600 text-sm m-0 mb-1">
                    ✓ {item}
                  </Text>
                ))}
              </div>
            )}

            <Text className="text-gray-500 text-sm leading-relaxed m-0 mb-6">
              You can create a new cleaning review from the review page:
            </Text>

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
              View cleaning review
            </Link>

            <Hr className="border-gray-100 my-10" />

            <Text className="text-xs text-gray-400 m-0">
              You received this email because an employee completed their cleaning review tasks.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
