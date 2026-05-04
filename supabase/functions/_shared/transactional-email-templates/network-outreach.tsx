import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Neova Space'

interface NetworkOutreachProps {
  contactName?: string
  intro?: string
  details?: Array<{ label: string; value: string }>
  message?: string
  clientBlock?: Array<{ label: string; value: string }>
  replyTo?: string
  signature?: string
}

const NetworkOutreachEmail = ({
  contactName = '',
  intro = 'We have a new client request that may match your profile.',
  details = [],
  message = '',
  clientBlock,
  replyTo = 'info@neovaspace.com',
  signature = 'Neova Space',
}: NetworkOutreachProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Neova opportunity</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>{SITE_NAME}</Text>
        <Heading style={h1}>{contactName ? `Hello ${contactName},` : 'Hello,'}</Heading>
        <Text style={text}>{intro}</Text>
        {details.length > 0 && (
          <Section style={card}>
            <Text style={cardTitle}>Project summary</Text>
            {details.map((d, i) => (
              <Text key={i} style={row}>
                <span style={label}>{d.label}</span>
                <span style={value}>{d.value || '—'}</span>
              </Text>
            ))}
          </Section>
        )}
        {message && (
          <Section style={card}>
            <Text style={cardTitle}>Project details</Text>
            <Text style={text}>{message}</Text>
          </Section>
        )}
        {clientBlock && clientBlock.length > 0 ? (
          <Section style={cardClient}>
            <Text style={cardTitle}>Client contact</Text>
            {clientBlock.map((d, i) => (
              <Text key={i} style={row}>
                <span style={label}>{d.label}</span>
                <span style={value}>{d.value || '—'}</span>
              </Text>
            ))}
          </Section>
        ) : (
          <Text style={text}>
            At this stage, client personal contact details are not shared.
          </Text>
        )}
        <Text style={text}>
          If you are interested and available, please reply to{' '}
          <a href={`mailto:${replyTo}`} style={{ color: '#1a1a1a' }}>{replyTo}</a> and we will coordinate the next step.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Best,<br />{signature}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NetworkOutreachEmail,
  subject: (data: Record<string, any>) => data?.subject || 'New Neova opportunity',
  displayName: 'Network outreach',
  previewData: {
    contactName: 'Jane',
    details: [
      { label: 'Type', value: 'Find a property' },
      { label: 'Location', value: 'Paris 7e' },
      { label: 'Budget', value: '1 200 000 €' },
    ],
    message: 'Looking for a 3-bedroom with balcony.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '580px', margin: '0 auto' }
const eyebrow = { fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#9a8f7a', margin: '0 0 14px' }
const h1 = { fontSize: '22px', fontWeight: 600, color: '#111111', margin: '0 0 18px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#4a4a4a', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#faf7f2', border: '1px solid #ece6da', borderRadius: '10px', padding: '18px 20px', margin: '0 0 16px' }
const cardClient = { backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '18px 20px', margin: '0 0 16px' }
const cardTitle = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#8a8170', margin: '0 0 10px', fontWeight: 600 }
const row = { fontSize: '13px', margin: '0 0 6px', lineHeight: '1.5' }
const label = { display: 'inline-block', width: '110px', color: '#8a8170', textTransform: 'uppercase' as const, fontSize: '11px', letterSpacing: '0.06em' }
const value = { color: '#111111', fontWeight: 500 }
const hr = { border: 'none', borderTop: '1px solid #ece6da', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#9a8f7a', margin: '8px 0 0', lineHeight: '1.5' }