// api/database/db.subscribers.js
const { getDb } = require("./client");
const { ObjectId } = require("mongodb");

async function findByViberId(viberId) {
  try {
    const db = await getDb();
    return await db.collection("subscribers").findOne({ viber_id: viberId });
  } catch (error) {
    console.log("findByViberId failed , reason :", error);
    throw error;
  }
}

async function createSubscriber(userProfile, userDetails, current_step) {
  try {
    const db = await getDb();
    const doc = {
      viber_id: userProfile.id,
      name: userProfile.name,
      user_profile: userProfile,
      user_details: userDetails,
      current_step,
      subscribed_on: new Date(),
    };

    const result = await db.collection("subscribers").insertOne(doc);
    // result.ops is not available in v4+. Use insertedId:
    return { _id: result.insertedId, ...doc };
    // or: return await db.collection("subscribers").findOne({ _id: result.insertedId });
  } catch (error) {
    console.log("createSubscriber failed , reason :", error);
    throw error;
  }
}

async function updateCurrentStep(viberId, currentStep) {
  try {
    const db = await getDb();
    return await db.collection("subscribers").updateOne(
      { viber_id: viberId },
      { $set: { current_step: currentStep } },
      { upsert: true }
    );
  } catch (error) {
    console.log("updateCurrentStep failed , reason :", error);
    throw error;
  }
}

module.exports = {
  findByViberId,
  createSubscriber,
  updateCurrentStep,
};
