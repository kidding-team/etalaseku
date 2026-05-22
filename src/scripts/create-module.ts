/** biome-ignore-all lint/suspicious/noConsole: <Disablae For This File> */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Ambil nama modul dari argumen
const moduleName = process.argv[2]
if (!moduleName) {
  console.error(
    '❌ Please provide a module name. Example: bun run create-module auth',
  )
  process.exit(1)
}

// Pastikan huruf kecil semua (biar konsisten)
const normalizedName = moduleName.toLowerCase()
const basePath = path.join('src', 'orpc', 'router', normalizedName)

if (existsSync(basePath)) {
  console.error('! Module already exists!')
  process.exit(1)
}

// Buat folder module
mkdirSync(basePath, { recursive: true })

// Struktur file yang ingin dibuat
const files = {
  controller: `${normalizedName}-controller.ts`,
  service: `${normalizedName}-services.ts`,
  repository: `${normalizedName}-repositories.ts`,
  schema: `${normalizedName}-schema.ts`,
}

// Isi default untuk tiap file
const content = {
  controller: `// controller: handle request & response, panggil service`,
  service: `// service: panggil repository untuk CRUD logic`,
  repository: `// repository: simpan data di memory, fungsi insert/find/update/delete`,
  schema: `// schema: validasi input pakai Zod`,
}

// Buat semua file dengan konten default
for (const [key, filename] of Object.entries(files)) {
  const fileContent = content[key as keyof typeof content]
  writeFileSync(path.join(basePath, filename), fileContent)
}

console.log(
  `✅ Module '${normalizedName}' created successfully at src/orpc/router/${normalizedName}/`,
)
