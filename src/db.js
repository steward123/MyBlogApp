import { MongoClient } from 'mongodb';
let db;
async function connectToDb(cb){
    //const client = new MongoClient('mongodb://127.0.0.1:27017');
    const Mongouri = 'mongodb+srv://hoshino:test123@atlascluster.pmccmbs.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
    const client = new MongoClient(Mongouri);
    await client.connect();
    db = client.db('react-blog-db');
    cb();
}

export {
    db,connectToDb,
};