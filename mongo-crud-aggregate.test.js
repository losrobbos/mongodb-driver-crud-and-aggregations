import { MongoClient, Db, Collection } from "mongodb";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const MONGO_URI = "mongodb://localhost"
const TEST_DATABASE_NAME = "testing_db"
const TEST_COLLECTION_NAME = "testing_collection"

describe("Test MongoDB Driver CRUD", () => {

    // global test suite variables (for reuse in testing)

    /** @type MongoClient */
    let client
    /** @type Db */
    let db
    /** @type Collection */
    let coll

    // connect to Mongo Client & create db + collection
    beforeAll(async () => {
        client = await MongoClient.connect(MONGO_URI)
        db = client.db(TEST_DATABASE_NAME)
        coll = await db.createCollection(TEST_COLLECTION_NAME)
        await coll.insertMany([
            { user: "rob", title: "Do some TDD setup", status: "DONE"},
            { user: "rob", title: "Do some Teardown", status: "DONE"},
            { user: "rob", title: "Add some sample data", status: "IN PROGRESS"},
            { user: "rob", title: "Do Mongoose CRUD", status: "IN PROGRESS"},
            { user: "rob", title: "Show some find Operators", status: "OPEN"},
            { user: "rob", title: "Do some Aggregation", status: "OPEN"},
            { user: "rob", title: "Do some more Aggregation", status: "OPEN"},
            { user: "rob", title: "Do even more Aggregation", status: "OPEN"},
        ])

    })

    // teardown - remove test database & exit mongo connection
    afterAll(async () => {
        await db.dropDatabase()
        await client.close()
    })

    // TESTS...
    test("create document", async () => {
        const doc = await coll.insertOne({ title: "Do some TDD", status: "IN PROGRESS" })
        expect(doc.acknowledged).toBe(true)
    })

    test("find document", async () => {
        const doc = await coll.findOne()
        expect(doc).not.toBeNull()
        expect(doc._id).toBeDefined()
    })

    test("find all todos", async () => {
        const cursor = coll.find()

        // expect to find a doc
        let hasnext = await cursor.hasNext()
        expect(hasnext).toBe(true)

        // get next doc
        // const doc = await cursor.next()
        // expect(doc._id).toBeTruthy()
        // expect(doc.title).toBeTruthy()

        const docs = await cursor.toArray()
        expect(docs.length).toBe(9)
        expect(docs[0]._id).toBeTruthy()

        // testing promise resolve
        // expect that cursor is exhausted
        // expect(cursor.hasNext()).resolves.toBe(false) // deprecated

        hasnext = await cursor.hasNext()
        expect(hasnext).toBe(false)
    })

    test("find by criteria", async () => {
        const docs = await coll.find({
            status: "DONE"
        }).toArray()
        expect(docs.length).toBe(2)
        expect(docs.at(-1).title).toBe("Do some Teardown")
    })

    test("find limit results / pages", async () => {
        // page 1 records (first 3)
        let docs = await coll.find({ }).limit(3).toArray()
        expect(docs.length).toBe(3)
        expect(docs[0].title).toBe("Do some TDD setup")
        
        // page 2 records (next 3)
        docs = await coll.find({ }).skip(3).limit(3).toArray()
        expect(docs.length).toBe(3)
        expect(docs[0].title).toBe("Do Mongoose CRUD")        
    })

    test("aggregate group", async () => {
        const cursor = coll.aggregate([
            {
                $group: {
                    _id: "$status",
                    docs: { $count: {} },
                }
            }
        ])
        const result = await cursor.toArray()
        console.log(result)
    })

})
