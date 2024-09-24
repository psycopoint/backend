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
} from "@react-email/components";
import * as React from "react";

// Estilos CSS
const styles = {
  body: {
    backgroundColor: "#f8f9fa", // bg-offwhite
    fontSize: "16px", // text-base
    fontFamily: "sans-serif",
  },
  container: {
    backgroundColor: "#ffffff", // bg-white
    padding: "45px",
  },
  heading: {
    textAlign: "center" as "center", // Especificando o tipo correto
    margin: "0",
    lineHeight: "2", // leading-8
  },
  section: {
    textAlign: "center" as "center",
  },
  text: {
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#007bff", // bg-brand
    color: "#ffffff",
    borderRadius: "8px",
    padding: "10px 18px", // py-3 px-[18px]
    textDecoration: "none",
  },
  link: {
    textDecoration: "none",
    color: "#007bff", // Cor padrão de links
  },
  footerText: {
    textAlign: "center" as "center",
    color: "#6c757d", // text-gray-400
    marginBottom: "45px",
  },
};

interface WelcomeEmailProps {
  plan: "Profissional+" | "Profissional";
}

export const WelcomeEmail = ({ plan }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao plano {plan} da Psycopoint!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.section}>
            <Img
              src="https://media.psycopoint.com/logo.png"
              width="150"
              height="30"
              alt="Psycopoint Logo"
              style={{ margin: "10px auto" }} // mx-auto my-10
            />
          </Section>

          <Heading style={styles.heading}>
            Bem-vindo ao <strong>{plan}</strong>
          </Heading>

          <Section>
            <Row>
              <Text style={styles.text}>
                Parabéns por ingressar no plano {plan}, estamos empolgados em
                ter você na Psycopoint, uma plataforma criada especialmente para
                psicólogos organizarem e otimizarem sua rotina de trabalho.
              </Text>

              <Text style={styles.text}>
                Agora você pode começar a gerenciar seus pacientes, acompanhar
                sessões e manter controle financeiro diretamente da nossa
                plataforma.
              </Text>

              <Text style={styles.text}>
                Aqui estão alguns próximos passos:
              </Text>
            </Row>
          </Section>

          <ul>
            <li style={styles.text}>
              <strong>Explore seu dashboard.</strong> Acesse o dashboard para
              começar a configurar sua conta e personalizar suas preferências.
            </li>
            <li style={styles.text}>
              <strong>Cadastre seus pacientes.</strong> Cadastre seus pacientes
              e acompanhe a evolução de cada um através do dashboard.
            </li>
            <li style={styles.text}>
              <strong>Agende suas primeiras sessões.</strong> Organize sua
              agenda de consultas com seus pacientes e acompanhe seus
              compromissos diretamente pelo sistema.
            </li>
            <li style={styles.text}>
              <strong>Controle suas finanças.</strong> Utilize nossas
              ferramentas para registrar os pagamentos de suas consultas e
              mantenha o controle financeiro de forma prática.
            </li>
          </ul>

          <Section style={styles.section}>
            <Button style={styles.button}>
              <Link
                style={{ color: "#ffffff", textDecoration: "none" }}
                href="https://app.psycopoint.com"
              >
                Acesse seu painel
              </Link>
            </Button>
          </Section>
        </Container>

        <Container style={{ marginTop: "20px" }}>
          {/* <Section>
            <Row>
              <Column style={{ textAlign: "right", padding: "0 20px" }}>
                <Link style={styles.link}>Cancelar inscrição</Link>
              </Column>
              <Column style={{ textAlign: "left" }}>
                <Link style={styles.link}>Gerenciar preferências</Link>
              </Column>
            </Row>
          </Section> */}
          <Text style={styles.footerText}>Att, Psycopoint.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
