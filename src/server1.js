import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import {db,connectToDb} from './db.js';

const credentials = JSON.parse(fs.readFileSync('./Credentials.json'));
admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });

const app = express();
app.use(express.json());

app.use(async (req,res,next)=>{
    const {authToken} = req.header;

    if(authToken)
    {
        try{
            req.user = await admin.auth().verifyIdToken(authToken);
        }catch(e)
        {
            res.sendStatus(400);
        }
    }

    next();

});

app.get('/api/articles/:name',async (req,res)=>{
    const {name} = req.params;
    const { uid } = req.user;
    const article = await db.collection('articles').findOne({name});
    if(article)
    {
        const upvoteIDs = article.upvoteIDs || [];
        article.CanUpvote = uid && !upvoteIDs.include(uid);
        res.json(article);
    }else
    {
        res.sendStatus(404).send('Article not found!!!');
    }
    
});

app.use((req,res,next)=>{
    if(req.user)
    {
        next();
    }
    else
    {
        res.sendStatus(401);
    }
});

app.put('/api/articles/:name/upvote',async (req,res)=>{
    const {name} = req.params;
    const {uid} = req.user;

    const article = await db.collection('articles').findOne({name});

    if(article)
    {
        const upvoteIDs = article.upvoteIDs || [];
        const CanUpvote = uid && !upvoteIDs.include(uid);

        if(CanUpvote)
        {
            await db.collection('articles').updateOne({name},{
                $inc:{upvotes:1},$push:{upvoteIDs:uid}
            });
        }
        const updatedarticle = await db.collection('articles').findOne({name});
        res.json(updatedarticle);
    }
    else
    {
        res.sendStatus(404);
    }
});

app.post('/api/articles/:name/comments',async(req,res)=>{
    const {name} = req.params;
    const {text} = req.body;
    const {email} = req.user;
    //const {postedBy,text} = req.body;
    await db.collection('articles').updateOne({name},
        {$push:{comments:{postedBy:email,text}},}
        );
        const article = await db.collection('articles').findOne({name});
        if(article)
    {
        /*res.json(article.comments);*/
        res.json(article);
    }
    else
    {
        res.sendStatus(404);
    }
});

const port = 8000;
connectToDb(()=>{
    console.log("Sucessfully connected to the Database!!");
app.listen(8000,()=>{
    console.log(`SERVER IS LISTENING ON ${port}`);
})
});

