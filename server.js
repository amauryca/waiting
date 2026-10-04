const express=require("express");
const http=require("http");
const {WebSocketServer}=require("ws");
const crypto=require("crypto");
const path=require("path");
const app=express(),server=http.createServer(app),wss=new WebSocketServer({server,path:"/ws"});
const guests=new Map();
app.use(express.static(path.join(__dirname,"."),{extensions:["html"]}));
app.get("/health",(_,res)=>res.json({ok:true,guests:guests.size}));
function cleanAvatar(a){if(!a||typeof a!=="object")return null;let name=String(a.name||"guest").replace(/[<>]/g,"").slice(0,18);let image=String(a.image||"");if(!image.startsWith("data:image/")||image.length>450000)return null;return{name,image}}
function broadcast(msg,except){let s=JSON.stringify(msg);for(const c of wss.clients)if(c!==except&&c.readyState===1)c.send(s)}
wss.on("connection",ws=>{let id=crypto.randomBytes(6).toString("hex");ws.send(JSON.stringify({type:"welcome",id,guests:[...guests.entries()].map(([id,g])=>({id,...g}))}));ws.on("message",raw=>{if(raw.length>500000)return;let m;try{m=JSON.parse(raw)}catch{return}if(m.type==="join"){let avatar=cleanAvatar(m.avatar);if(!avatar)return;let g={avatar,x:Math.max(0,Math.min(1,Number(m.x)||.5)),v:Math.max(-.5,Math.min(.5,Number(m.v)||.2))};guests.set(id,g);broadcast({type:"guest",guest:{id,...g}},ws)}if(m.type==="move"&&guests.has(id)){let g=guests.get(id);g.x=Math.max(0,Math.min(1,Number(m.x)||g.x));g.v=Math.max(-.5,Math.min(.5,Number(m.v)||g.v));broadcast({type:"guest",guest:{id,...g}},ws)}});ws.on("close",()=>{if(guests.delete(id))broadcast({type:"leave",id})})});
const port=process.env.PORT||3000;server.listen(port,()=>console.log("Waiting room live on :"+port));