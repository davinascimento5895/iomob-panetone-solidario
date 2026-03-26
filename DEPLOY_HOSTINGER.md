# Deploy para Hostinger — instruções rápidas

Este repositório já contém a pasta `dist/` pronta para upload com um `.htaccess` configurado para Single-Page App (SPA), cache e tipos MIME (AVIF).

Opções de deploy (escolha uma):

1) Usando o painel Hostinger (File Manager)
   - Faça upload do arquivo `dist.zip` (este repositório inclui `dist.zip` na raiz).
   - No File Manager, clique com o botão direito e escolha "Extract" para extrair o conteúdo.
   - Mova os arquivos extraídos para a raiz do site (`public_html`) — ou coloque a pasta `dist` inteira dentro de `public_html` se preferir manter a pasta.
   - Verifique se `index.html` e `.htaccess` estão no mesmo nível que `public_html` (ou dentro da pasta que você está servindo).

2) Usando FTP/SFTP
   - Conecte-se via SFTP/FTP ao Hostinger e envie o conteúdo da pasta `dist/` para `public_html/`.
   - Certifique-se de que `.htaccess` também foi enviado.

3) Usando SSH (se disponível)
   - Faça upload de `dist.zip` e depois execute na hospedagem:

```
unzip dist.zip -d public_html
# ou para extrair o conteúdo direto na pasta atual
# unzip dist.zip && mv dist/* public_html/
```

Observações importantes
- O `.htaccess` incluído roteia todas as requisições não correspondentes a ficheiros para `index.html` (fallback para SPA) e aplica políticas de cache adequadas.
- Se você estiver servindo a aplicação em um subpath (ex.: `https://example.com/app/`), atualize a opção `base` no `vite.config.ts` antes de rodar `npm run build`:

```js
export default defineConfig({
  base: '/app/',
  // ...
})
```

- Para publicar o `dist.zip` no GitHub (para baixar depois), você deve `git push` para um repositório remoto — o push não foi realizado por mim aqui por razões de autenticação.

Comandos úteis locais

```powershell
# compactar a pasta 'dist' (Windows)
Compress-Archive -Path dist -DestinationPath dist.zip -Force

# commitar os arquivos preparados (se desejar enviar ao remote, rode 'git push')
# (força a inclusão caso 'dist/' esteja em .gitignore)
 git add -f dist/.htaccess dist.zip DEPLOY_HOSTINGER.md
 git commit -m "chore(deploy): prepare dist for Hostinger (add .htaccess, dist.zip, docs)"
```

Se quiser, eu posso tentar fazer o `git push` para o remote, mas preciso de credenciais (não forneça aqui). Em alternativa, você pode baixar `dist.zip` após eu gerá-lo e fazer o upload pelo painel da Hostinger.
