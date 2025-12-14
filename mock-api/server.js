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
  { id:4, title:'Mediterranean Cooking Class', category:'food', price_cents:15900, duration_min:150, images:['https://picsum.photos/seed/cooking/720/400'], short_description:'Learn authentic recipes.'},
  { id:5, title:'Mountain Hiking Adventure', category:'adventure', price_cents:19900, duration_min:240, images:['https://picsum.photos/seed/hiking/720/400'], short_description:'Conquer scenic peaks.'},
  { id:6, title:'Historical City Tour', category:'culture', price_cents:8900, duration_min:120, images:['https://picsum.photos/seed/tour/720/400'], short_description:'Discover ancient stories.'},
  { id:7, title:'Cheese & Wine Pairing', category:'food', price_cents:13900, duration_min:90, images:['https://picsum.photos/seed/cheese/720/400'], short_description:'Perfect combinations.'},
  { id:8, title:'Rock Climbing Experience', category:'adventure', price_cents:22900, duration_min:180, images:['https://picsum.photos/seed/climbing/720/400'], short_description:'Scale new heights.'},
  { id:9, title:'Art Museum Private Tour', category:'culture', price_cents:11900, duration_min:120, images:['https://picsum.photos/seed/art/720/400'], short_description:'Explore masterpieces.'},
  { id:10, title:'Seafood Market Tour', category:'food', price_cents:16900, duration_min:180, images:['https://picsum.photos/seed/seafood/720/400'], short_description:'Fresh catch of the day.'},
  { id:11, title:'Surfing Lessons', category:'adventure', price_cents:18900, duration_min:120, images:['https://picsum.photos/seed/surfing/720/400'], short_description:'Ride the waves.'},
  { id:12, title:'Traditional Dance Workshop', category:'culture', price_cents:9900, duration_min:90, images:['https://picsum.photos/seed/dance/720/400'], short_description:'Learn local moves.'},
  { id:13, title:'Farm to Table Experience', category:'food', price_cents:17900, duration_min:210, images:['https://picsum.photos/seed/farm/720/400'], short_description:'From field to plate.'},
  { id:14, title:'Paragliding Adventure', category:'adventure', price_cents:26900, duration_min:60, images:['https://picsum.photos/seed/paragliding/720/400'], short_description:'Soar through the skies.'},
  { id:15, title:'Ancient Ruins Exploration', category:'culture', price_cents:10900, duration_min:180, images:['https://picsum.photos/seed/ruins/720/400'], short_description:'Step back in time.'},
  { id:16, title:'Chocolate Making Workshop', category:'food', price_cents:14900, duration_min:120, images:['https://picsum.photos/seed/chocolate/720/400'], short_description:'Create sweet memories.'},
  { id:17, title:'Scuba Diving Discovery', category:'adventure', price_cents:28900, duration_min:180, images:['https://picsum.photos/seed/diving/720/400'], short_description:'Dive into the deep.'},
  { id:18, title:'Local Music Performance', category:'culture', price_cents:7900, duration_min:90, images:['https://picsum.photos/seed/music/720/400'], short_description:'Feel the rhythm.'},
  { id:19, title:'Pasta Making Class', category:'food', price_cents:16900, duration_min:150, images:['https://picsum.photos/seed/pasta/720/400'], short_description:'Handmade Italian pasta.'},
  { id:20, title:'White Water Rafting', category:'adventure', price_cents:21900, duration_min:180, images:['https://picsum.photos/seed/rafting/720/400'], short_description:'Navigate wild rapids.'},
  { id:21, title:'Archaeological Site Visit', category:'culture', price_cents:11900, duration_min:150, images:['https://picsum.photos/seed/archaeology/720/400'], short_description:'Uncover hidden treasures.'},
  { id:22, title:'Olive Oil Tasting', category:'food', price_cents:12900, duration_min:90, images:['https://picsum.photos/seed/olive/720/400'], short_description:'Taste the finest oils.'},
  { id:23, title:'Bungee Jumping Thrill', category:'adventure', price_cents:23900, duration_min:45, images:['https://picsum.photos/seed/bungee/720/400'], short_description:'Leap into adventure.'},
  { id:24, title:'Folklore Evening Show', category:'culture', price_cents:9900, duration_min:120, images:['https://picsum.photos/seed/folklore/720/400'], short_description:'Traditional performances.'},
  { id:25, title:'BBQ Masterclass', category:'food', price_cents:15900, duration_min:180, images:['https://picsum.photos/seed/bbq/720/400'], short_description:'Master the grill.'},
  { id:26, title:'Cave Exploration', category:'adventure', price_cents:19900, duration_min:240, images:['https://picsum.photos/seed/cave/720/400'], short_description:'Explore underground wonders.'},
  { id:27, title:'Calligraphy Workshop', category:'culture', price_cents:10900, duration_min:120, images:['https://picsum.photos/seed/calligraphy/720/400'], short_description:'Master the art of writing.'},
  { id:28, title:'Truffle Hunting Experience', category:'food', price_cents:22900, duration_min:180, images:['https://picsum.photos/seed/truffle/720/400'], short_description:'Hunt for culinary gold.'},
  { id:29, title:'Zipline Adventure', category:'adventure', price_cents:17900, duration_min:90, images:['https://picsum.photos/seed/zipline/720/400'], short_description:'Fly through the forest.'},
  { id:30, title:'Traditional Pottery Class', category:'culture', price_cents:13900, duration_min:150, images:['https://picsum.photos/seed/pottery/720/400'], short_description:'Shape your creativity.'},
]

const refreshStore = new Map()

function issueTokens(user){
  const exp = Math.floor(Date.now()/1000) + 60 * 5
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

app.get('/experiences', auth, async (req,res)=>{  
  if (Math.random() < 0.01) return res.status(429).json({ error:'rate' }) // 1% instead of 10%
  const q = (req.query.q || '').toString().toLowerCase()
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const pageSize = 6 
  
  let filtered = EXPERIENCES.filter(x=> x.title.toLowerCase().includes(q))
  const total = filtered.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = filtered.slice(startIndex, endIndex)
  
  res.json({ data, page, pageSize, total })
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
