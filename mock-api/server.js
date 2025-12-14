import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(bodyParser.json())

const SECRET = 'dev-secret'
const USERS = [
  { id:'1', email:'user@example.com', role:'user', password:'password' },
  { id:'2', email:'admin@example.com', role:'admin', password:'password' }
]

const EXPERIENCES = [
  { id:1, title:'Wine Tasting in Tuscany', category:'food', price_cents:12900, duration_min:180, images:['https://picsum.photos/seed/wine/720/400'], short_description:'Explore Tuscan vineyards.'},
  { id:2, title:'Skydiving Over the Coast', category:'adventure', price_cents:24900, duration_min:60, images:['https://picsum.photos/seed/sky/720/400'], short_description:'Adrenaline-packed jump.'},
  { id:3, title:'Private Sushi Workshop', category:'culture', price_cents:17900, duration_min:120, images:['https://picsum.photos/seed/sushi/720/400'], short_description:'Master sushi basics.'},
]

const refreshStore = new Map()

function issueTokens(user){
  const exp = Math.floor(Date.now()/1000) + 60*5
  const access_token = jwt.sign({ sub:user.id, role:user.role, exp }, SECRET, { algorithm:'HS256' })
  const refresh_token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  refreshStore.set(refresh_token, { userId:user.id, role:user.role, exp: exp + 60*60 })
  return { access_token, refresh_token, exp }
}

app.post('/auth/login', (req,res)=>{
  const { email, password } = req.body
  const user = USERS.find(u=>u.email===email && u.password===password)
  if(!user) return res.status(401).json({ error:'invalid' })
  const { access_token, refresh_token, exp } = issueTokens(user)
  res.json({ access_token, refresh_token, user: { id:user.id, email:user.email, role:user.role }, exp })
})

app.post('/auth/refresh', (req,res)=>{
  const { refresh_token } = req.body
  const rec = refreshStore.get(refresh_token)
  if(!rec) return res.status(401).json({ error:'invalid refresh' })
  const user = USERS.find(u=>u.id===rec.userId)
  if(!user) return res.status(401).json({ error:'invalid user' })
  const rotated = Math.random() < 0.5
  const { access_token, refresh_token: newRt, exp } = issueTokens(user)
  if(rotated){
    refreshStore.delete(refresh_token)
    return res.json({ access_token, refresh_token: newRt, exp })
  } else {
    return res.json({ access_token, exp })
  }
})

function auth(req,res,next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if(!token) return res.status(401).json({ error:'missing token' })
  try{
    const payload = jwt.verify(token, SECRET)
    req.user = payload
    next()
  }catch(e){
    return res.status(401).json({ error:'invalid token' })
  }
}

app.get('/experiences', auth, (req,res)=>{
  if (Math.random() < 0.1) return res.status(429).json({ error:'rate' })
  const q = (req.query.q || '').toString().toLowerCase()
  let data = EXPERIENCES.filter(x=> x.title.toLowerCase().includes(q))
  res.json({ data, page:1, pageSize:data.length, total:data.length })
})

app.get('/experiences/:id', auth, (req,res)=>{
  const id = Number(req.params.id)
  const x = EXPERIENCES.find(e=>e.id===id)
  if(!x) return res.status(404).json({ error:'not found' })
  res.json(x)
})

app.delete('/experiences/:id', auth, (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ error:'forbidden' })
  const id = Number(req.params.id)
  const idx = EXPERIENCES.findIndex(e=>e.id===id)
  if(idx===-1) return res.status(404).json({ error:'not found' })
  EXPERIENCES.splice(idx,1)
  res.status(204).end()
})

app.listen(3001, ()=> console.log('Mock API on http://localhost:3001'))
