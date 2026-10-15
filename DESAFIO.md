# Desafio — ISAC Conecta

> O que foi pedido, **por que** vamos fazer cada coisa e **quem** cobre cada parte.
> Painel com prazos e situação de cada entrega: https://dashboard-atividades-pi.vercel.app/#desafio
> Os dados do painel ficam em `data/plano.js`. Se algo aqui estiver desatualizado, avise a Vanessa.

## 1. Contexto

- **Desafio:** Comunidade Conecta, uma plataforma inteligente para organizar oportunidades locais a partir de grupos de WhatsApp.
- **Quem propôs:** Instituto Social e Ambiental do Cabo (ISAC), Cabo de Santo Agostinho/PE.
- **Programa:** Projeto Integrador da Residência em Software & IA (GrowUp / Porto Digital).
- **Avaliação:** entrega única, o projeto final apresentado ao Ronaldo. Tem que ser real e funcionar.

## 2. O problema

Os grupos de WhatsApp do bairro passam de duas mil mensagens por dia. O anúncio de um pequeno empreendedor some em minutos. Não há busca, categoria, histórico nem forma de saber em quem confiar, e os anúncios se repetem.

O ISAC vive de doações e rifas, sem receita recorrente. Esse é o maior risco da instituição.

## 3. Nossa resposta

Usar IA para transformar o caos dos grupos de WhatsApp na economia organizada do bairro, e converter isso em receita recorrente que sustenta o ISAC. A meta é de **R$ 2.000 por mês**, calculada a partir dos gastos do instituto.

```
Front (cola o texto) → API → IA (extrai e marca repetido) → Banco (pendente) → Moderação → Vitrine
```

O modelo tem dois lados: é grátis para quem procura e pago para o comércio que quer destaque. Uma parte de cada pagamento fica com o ISAC.

## 4. Os nove pedidos do desafio

| Pedido | Por que fazer | Quem |
|---|---|---|
| Protótipo web no celular | Quem vai usar está no celular, e a banca testa no celular | Thawana, Suedson, Luan, Matheus, Vanessa |
| Cadastro nas categorias | Sem categoria fixa, a busca não funciona e cada um inventa um nome | Kaio, James |
| Busca e filtros | É a dor central: no grupo o anúncio some, aqui ele é encontrado | James, Thawana |
| Classificação por IA | É o diferencial: a mensagem informal vira anúncio organizado sem formulário | Demetrius, James |
| Área pública gratuita | Consultar e publicar de graça é o que atrai o comércio que paga | Thawana |
| Área premium | É daqui que vem a receita recorrente do ISAC | Kaio, Thawana, Suedson |
| Painel administrativo | A equipe do ISAC controla o que aparece, e a plataforma fica confiável | Luan, James |
| Arquitetura para o WhatsApp | Hoje entra o .txt, amanhã o webhook, na mesma rota e sem violar os termos | Vanessa |
| Documentação e apresentação | A nota sai da apresentação; a documentação mostra como e por que decidimos | Vanessa, com todos |
| **Diferencial:** modelo de negócio | Prova que a solução é viável e sustenta o ISAC | Vanessa, com números do Kaio e do Demetrius |

## 5. Pedidos do Ronaldo

| Pedido | Por que fazer | Quem |
|---|---|---|
| Termos de uso | Quem anuncia responde pelo conteúdo, não o ISAC | Vanessa (texto), Luan e Suedson (aceite), Kaio (registro), James (API) |
| Verificar o anúncio | Todo anúncio passa pela equipe. A IA ajuda, a equipe decide | Luan, James |
| Verificar quem publica | O selo é da pessoa. Aprovar um anúncio não dá selo a ninguém | James, Kaio, Luan |
| Retorno quando recusa | Sem saber o motivo, a pessoa não sabe o que corrigir e desiste | Luan, James, Suedson |
| Anúncio repetido e golpe | Polui a vitrine e é sinal comum de golpe; a marcação ajuda a moderação | João Vitor, Demetrius, James |

## 6. Por que cada frente existe

| Pessoa | Frente | Por quê |
|---|---|---|
| Vanessa | Coordenação, revisão, testes e design (com o Matheus) | Sem alguém juntando e testando, as peças não encaixam |
| Matheus | Design | O front constrói a partir do Figma; tela que falta vira improviso |
| James | API | É a ponte entre telas, banco e IA, e hoje é o que trava o Publicar |
| Kaio | Banco | Guarda o que a moderação decide; filtros e Meus anúncios dependem dele |
| Demetrius | IA (extração) | É o diferencial; o plano B garante que a demo não para |
| João Vitor | IA (duplicidade e qualidade) | Dá confiança ao morador e ajuda a moderação |
| Thawana | Vitrine e integração | É o que o Ronaldo e o morador veem primeiro |
| Suedson | Morador e comércio | O Publicar mostra a IA funcionando; a área do comércio é o lado que paga |
| Luan | Equipe do ISAC | Sem login e moderação, qualquer pessoa aprova qualquer coisa |

## 7. Fora desta entrega

- **WhatsApp ao vivo.** A API oficial tem custo e exige empresa aprovada, e as bibliotecas não oficiais violam os termos de uso. Por isso entra só a importação da conversa (.txt), e a arquitetura fica pronta para o webhook.
- **Pagamento real.** A área premium é demonstrada sem cobrança de verdade.

## 8. Combinados

- Travou ou não vai dar no prazo? Avise no grupo ou no privado da Vanessa **com um dia de antecedência**.
- Todo mundo ajuda todo mundo. O grupo passa junto.
- Chave, senha e arquivo `.env` nunca vão para o GitHub nem para o grupo.
- Cada tarefa em uma branch a partir da `dev`, com pull request revisado por outra pessoa.
