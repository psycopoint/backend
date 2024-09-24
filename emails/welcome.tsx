import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";
import { twConfig } from "./tailwind-config";

interface WelcomeEmailProps {
  plan: "Profissional+" | "Profissional";
}

export const WelcomeEmail = ({ plan }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao plano {plan} da Psycopoint!</Preview>
      <Tailwind config={twConfig}>
        <Body className="bg-offwhite text-base font-sans">
          <Container className="bg-white p-45">
            <Section className="text-center">
              <Img
                src="https://media.psycopoint.com/logo.png"
                width="150"
                height="50"
                alt="Psycopoint Logo"
                className="mx-auto my-10"
              />
            </Section>

            <Heading className="text-center my-0 leading-8">
              Bem-vindo ao {plan} da Psycopoint!
            </Heading>

            <Section>
              <Row>
                <Text className="text-base">
                  Parabéns por ingressar no plano {plan}! Estamos empolgados em
                  ter você na Psycopoint, uma plataforma criada especialmente
                  para psicólogos organizarem e otimizarem sua rotina de
                  trabalho.
                </Text>

                <Text className="text-base">
                  Agora você pode começar a gerenciar seus pacientes, acompanhar
                  sessões e manter controle financeiro diretamente da nossa
                  plataforma.
                </Text>

                <Text className="text-base">
                  Aqui estão alguns próximos passos:
                </Text>
              </Row>
            </Section>

            <ul>
              <li className="mb-20">
                <strong>Explore seu painel.</strong> Acesse o painel de controle
                para começar a configurar sua conta e personalizar suas
                preferências.
              </li>
              <li className="mb-20">
                <strong>Agende suas primeiras sessões.</strong> Organize sua
                agenda de consultas com seus pacientes e acompanhe seus
                compromissos diretamente pelo sistema.
              </li>
              <li className="mb-20">
                <strong>Controle suas finanças.</strong> Utilize nossas
                ferramentas para registrar os pagamentos de suas consultas e
                mantenha o controle financeiro de forma prática.
              </li>
            </ul>

            <Section className="text-center">
              <Button className="bg-brand text-white rounded-lg py-3 px-[18px]">
                Acesse seu painel
              </Button>
            </Section>
          </Container>

          <Container className="mt-20">
            <Section>
              <Row>
                <Column className="text-right px-20">
                  <Link>Cancelar inscrição</Link>
                </Column>
                <Column className="text-left">
                  <Link>Gerenciar preferências</Link>
                </Column>
              </Row>
            </Section>
            <Text className="text-center text-gray-400 mb-45">
              Att, Psycopoint.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
