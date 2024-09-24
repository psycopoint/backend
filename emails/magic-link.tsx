import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkProps {
  magicLink?: string;
}

export const MagicLink = ({ magicLink }: MagicLinkProps) => (
  <Html>
    <Head />
    <Preview>Faça login com este link mágico.</Preview>
    <Body className="bg-white font-sans">
      <Container className="mx-auto p-6 bg-white shadow-lg">
        <Img
          src="https://media.psycopoint.com/logo.png"
          width={48}
          height={48}
          alt="Psycopoint"
          className="mx-auto"
        />
        <Heading className="text-2xl font-bold text-center mt-4">
          🪄 Seu link mágico
        </Heading>
        <Section className="mt-6">
          <Text className="text-lg text-center">
            <Link className="text-red-500 font-semibold" href={magicLink}>
              👉 Clique aqui para fazer login 👈
            </Link>
          </Text>
          <Text className="text-lg text-center mt-2">
            Se você não solicitou isso, por favor, ignore este e-mail.
          </Text>
        </Section>
        <Text className="text-lg text-center mt-4">
          Atenciosamente,
          <br />- Equipe Psycopoint
        </Text>
        <Hr className="border-gray-300 mt-8" />
        <Img
          src="https://media.psycopoint.com/logo.png"
          width={32}
          height={32}
          className="mx-auto my-4 opacity-50"
        />
        <Text className="text-gray-500 text-sm text-center">
          Att, Psycopoint.
        </Text>
      </Container>
    </Body>
  </Html>
);

MagicLink.PreviewProps = {
  magicLink: "https://psycopoint.com",
} as MagicLinkProps;

export default MagicLink;
