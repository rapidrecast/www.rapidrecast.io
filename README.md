# www.rapidrecast.io
RapidRecast website

Remember to use `--buildFuture` in case publish dates do not work.

```bash
hugo serve --debug --verbose --buildFuture
```


Debug code for articles; Put this into `layouts/default/_list.html`

```html
<section class="flex flex-col gap-10">
  <h2>Debugging All Found Pages</h2>
  {{ range $index, $page := .Site.RegularPages }}
    <div class="border p-4">
      <h3>Page {{ add $index 1 }}: {{ $page.Title }}</h3>
      <p><strong>Path:</strong> {{ $page.RelPermalink }}</p>
      <p><strong>Type:</strong> {{ $page.Type }}</p>
      <p><strong>Section:</strong> {{ $page.Section }}</p>
      <p><strong>Params:</strong> {{ $page.Params | jsonify }}</p>
    </div>
  {{ end }}
</section>
```