# ISAC Conecta — reta final

Painel estático para o grupo ver a data de hoje, a próxima entrega, a próxima reunião e a frente de cada pessoa.

Produção: https://dashboard-atividades-pi.vercel.app

Para ver localmente:

```bash
python3 -m http.server 4173
```

A situação de cada entrega fica em `data/plano.js`. Depois que alguém confirmar no WhatsApp, mude `situacao` para `pronto`, `parcial` ou `falta`.

O desafio, o porquê de cada frente e quem cobre cada pedido estão em [DESAFIO.md](DESAFIO.md).
