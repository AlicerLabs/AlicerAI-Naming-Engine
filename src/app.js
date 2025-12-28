const seeds = {
  flowers: ["Blossom","Rose","Lily","Iris","Camellia","Peony","Azalea","Magnolia","Dahlia","Jasmine","Orchid","Violet","Primrose","Tulip","Lotus","Cherry","Sakura","Hibiscus","Aster","Freesia"],
  gems: ["Diamond","Pearl","Sapphire","Ruby","Opal","Topaz","Emerald","Quartz","Onyx","Garnet","Amethyst","Peridot","Moonstone","Citrine","Tourmaline"],
  aura: ["Aura","Nova","Luxe","Prime","Serene","Velvet","Silk","Ivory","Blush","Gilded","Celeste","Ethereal","Radiant","Stellar","Elegant"],
  stellar: ["Nova","Nebula","Orion","Lyra","Vega","Cosmo","Sol","Luna","Quasar","Zenith","Polaris","Comet","Orbit","Pulsar"],
  mythic: ["Seraph","Muse","Nymph","Phoenix","Sylph","Athena","Iris","Nyx","Astra","Eos","Aether","Rune","Mythos"],
  suffixCute: ["Petal","Bloom","Charm","Belle","Spark","Twinkle","Flair"],
  suffixElegant: ["Luxe","Prime","Velour","Grace","Amor","Gleam","Fleur"],
  suffixPro: ["Core","Edge","Fusion","Axis","Nexus","Layer","Engine"]
}
const el = id => document.getElementById(id)
const pick = a => a[Math.floor(Math.random()*a.length)]
const cap = s => s.replace(/\s+/g," ").trim().replace(/(^.|\s.)/g,x=>x.toUpperCase())
const joinPair = (a,b,style) => {
  const k = style<30?"cute":style>70?"pro":"elegant"
  const joiner = k==="pro"?"-":" "
  return cap([a,b].filter(Boolean).join(joiner))
}
const score = (s,style) => {
  let v = 0
  if(/^[A-Z][a-z]+(?:\s|-)[A-Z]/.test(s)) v+=2
  if(s.length>=4&&s.length<=16) v+=2
  if(style>70 && s.includes("-")) v+=1
  if(style<30 && /[aeiou]{2}/i.test(s)) v+=1
  return v
}
const generateAlicer = ({seedSource, style, count}) => {
  const baseWords = []
  if(seedSource==="random") baseWords.push(...seeds.flowers,...seeds.gems,...seeds.aura,...seeds.stellar,...seeds.mythic)
  if(seedSource==="flowers") baseWords.push(...seeds.flowers)
  if(seedSource==="gems") baseWords.push(...seeds.gems)
  if(seedSource==="aura") baseWords.push(...seeds.aura)
  if(seedSource==="stellar") baseWords.push(...seeds.stellar)
  if(seedSource==="mythic") baseWords.push(...seeds.mythic)
  const pool = baseWords
  const out = new Set()
  let guard = 0
  while(out.size < count && guard < 1000) {
    guard++
    const a = pick(pool)
    const b = pick(pool.filter(x=>x!==a))
    const n = joinPair(a,b,style)
    if(n.length<=18) out.add(n)
  }
  const arr = Array.from(out).sort((x,y)=>score(y,style)-score(x,style))
  return arr
}
const geminiGenerate = async ({key, seedSource, style, count}) => {
  const guide = "Generate elegant two-word pairs balancing cute, elegant, professional. Use flowers, gems, aura, stellar, mythic depending on seed source. Return a plain newline list without numbering."
  const prompt = `${guide}\nSeed Source: ${seedSource}\nStyle: ${style}\nCount: ${Math.min(Math.max(count,1),24)}`
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+encodeURIComponent(key)
  const body = { contents: [{ role: "user", parts: [{ text: prompt }]}] }
  const r = await fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) })
  if(!r.ok) throw new Error("Gemini request failed")
  const j = await r.json()
  const text = ((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts&&j.candidates[0].content.parts[0]&&j.candidates[0].content.parts[0].text)||"")
  const lines = text.split(/\r?\n/).map(x=>x.replace(/^[-*\d.\s]+/,'').trim()).filter(Boolean)
  const clean = lines.map(cap).slice(0,count)
  if(clean.length===0) throw new Error("No names returned")
  return clean
}
const resultsEl = el("results")
const render = (names, metaLabel) => {
  resultsEl.innerHTML = ""
  names.forEach((n,i)=>{
    const v = document.createElement("div")
    v.className = "card"
    const h = document.createElement("h3")
    h.textContent = n
    const m = document.createElement("div")
    m.className = "meta"
    m.textContent = `${metaLabel} · #${i+1}`
    v.appendChild(h)
    v.appendChild(m)
    resultsEl.appendChild(v)
  })
}
const state = { mode: "alicer" }
const setMode = mode => {
  state.mode = mode
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active', b.dataset.mode===mode))
  document.querySelector('.gemini-key').hidden = mode!=="gemini"
}
document.querySelectorAll('.mode-btn').forEach(b=>{
  b.addEventListener('click',()=>setMode(b.dataset.mode))
})
const collect = () => ({
  customName: el("customName").value,
  seedSource: el("seedSource").value,
  style: Number(el("style").value),
  count: Number(el("count").value)
})
const generate = async () => {
  const opts = collect()
  try {
    if(state.mode==="gemini") {
      const key = el("geminiKey").value.trim()
      const pairs = key? await geminiGenerate({ key, seedSource: opts.seedSource, style: opts.style, count: opts.count }): generateAlicer(opts)
      const full = pairs.map(p=>`${opts.customName} - ${p}`)
      render(full, cap(opts.seedSource))
      return
    }
    const pairs = generateAlicer(opts)
    const full = pairs.map(p=>`${opts.customName} - ${p}`)
    render(full, cap(opts.seedSource))
  } catch(e) {
    const pairs = generateAlicer(opts)
    const full = pairs.map(p=>`${opts.customName} - ${p}`)
    render(full, cap(opts.seedSource))
  }
}
el("generate").addEventListener("click", generate)
el("shuffle").addEventListener("click", generate)
el("customName").addEventListener("keydown", e=>{ if(e.key==="Enter") generate() })
const namesToText = () => Array.from(resultsEl.querySelectorAll('.card h3')).map(x=>x.textContent).join("\n")
el("copy").addEventListener("click", async ()=>{
  const t = namesToText()
  await navigator.clipboard.writeText(t)
})
el("exportjson").addEventListener("click", ()=>{
  const a = document.createElement("a")
  const blob = new Blob([JSON.stringify({ names: Array.from(resultsEl.querySelectorAll('.card h3')).map(x=>x.textContent) }, null, 2)], { type: "application/json" })
  a.href = URL.createObjectURL(blob)
  a.download = "alicerai-names.json"
  a.click()
})
el("exportcsv").addEventListener("click", ()=>{
  const a = document.createElement("a")
  const blob = new Blob([namesToText()], { type: "text/plain" })
  a.href = URL.createObjectURL(blob)
  a.download = "alicerai-names.csv"
  a.click()
})
setMode("alicer")
const bootPairs = generateAlicer({ seedSource: "random", style: 50, count: 8 })
const bootFull = bootPairs.map(p=>`AlicerAI Nano 2 Pro v3.5 - ${p}`)
render(bootFull, "Random")