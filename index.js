const express = require('express')
const fs = require('fs')
const path = require('path')
const httpsServer = require('https')
const { Fido2Lib }  = require('fido2-lib')
const res = require('express/lib/response')
var ab2str = require('arraybuffer-to-string')
const crypto = require('crypto')
const base64lib = require('base64url')
const app = express()


const sslServer = httpsServer.createServer({
    key:fs.readFileSync(path.join(__dirname,'cert','key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
},app)

const f2 = new Fido2Lib({
    timeout: 42,
    rpId: "192.168.0.106:3000",
    rpName: "AK3632555",
    rpIcon: "https://192.168.0.106:3000",
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7, -257],
    authenticatorAttachment: "platform",
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: "required"
});



app.use("/auth/register",async (req,res,next)=>{
    const registrationOptions =  f2.attestationOptions();
    registrationOptions.then((result)=>{
        var enc = ab2str(result.challenge,'base64')
        var testch = "ak363255"
        var challenge = base64lib(crypto.randomBytes(32))
        result.challenge = challenge
        let data = 'stackabuse.com';
        let buff = new Buffer(data);
         let base64data = buff.toString('base64');
        result.user.id = base64lib(crypto.randomBytes(32))//base64data//crypto.randomBytes(32).toString('base64')
        result.user.name = "Ak"
        result.user.displayName="Ak"
        res.json(result)
}).catch((err)=>{
           res.send("err "+err)
})
})

app.use("/.well-known/assetlinks.json",async(req,res,next)=>{
    fs.readFile("assetlinks.json","utf-8",(err,data)=>{
        if(err){
            res.json({
                "status":"fail"
            })
        }else{
            var jsonData = JSON.parse(data)
            res.json(jsonData)
        }
    })

})




sslServer.listen(3000,()=>{console.log("listening on port 3000")})