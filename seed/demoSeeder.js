// ======================================================
// IMPORTS
// ======================================================

import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";

import User from "../models/User.js";
import Note from "../models/Note.js";

dotenv.config();

// ======================================================
// DEMO USERS
// ======================================================

const demoUsers = [
  {
    username: "caleb",
    email: "caleb@example.com",
    password: "Demo1234",
  },
  {
    username: "alex",
    email: "alex@example.com",
    password: "Demo1234",
  },
  {
    username: "sam",
    email: "sam@example.com",
    password: "Demo1234",
  },
];

// ======================================================
// SEED DEMO DATA
// ======================================================

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log("Creating NoteSpace demo data...");

    // --------------------------------------------------
    // REMOVE EXISTING DEMO DATA
    // --------------------------------------------------

    const existingDemoUsers = await User.find({
      $or: [
        {
          username: {
            $in: demoUsers.map((user) => user.username),
          },
        },
        {
          email: {
            $in: demoUsers.map((user) => user.email),
          },
        },
      ],
    });

    const demoUserIds = existingDemoUsers.map((user) => user._id);
    if (demoUserIds.length > 0) {
      await Note.deleteMany({
        owner: {
          $in: demoUserIds,
        },
      });

      await User.deleteMany({
        _id: {
          $in: demoUserIds,
        },
      });
    }

    // --------------------------------------------------
    // CREATE DEMO USERS
    // --------------------------------------------------

    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const [caleb, alex, sam] = createdUsers;
    console.log("Demo users created.");

    // --------------------------------------------------
    // CREATE DEMO NOTES
    // --------------------------------------------------

    const notes = await Note.create([
      {
        title: "Building Better Portfolio Projects",
        content: `
          <h2>Build something that tells a story</h2>
          <p>
            A portfolio project should demonstrate more than whether
            an application works. It should show how a problem was
            approached, how decisions were made, and how the project
            improved over time.
          </p>
          <p>
            The best projects give people something meaningful to
            explore instead of simply presenting a list of features.
          </p>
        `,
        owner: caleb._id,
        isPublished: true,
      },
      {
        title: "Making Technology Easier to Use",
        content: `
          <h2>Good technology should feel approachable</h2>
          <p>
            Powerful features are useful, but they matter much less
            when people cannot understand how to use them.
          </p>
          <p>
            Clear navigation, helpful feedback, and simple language
            can turn a complicated tool into something people are
            comfortable exploring.
          </p>
        `,
        owner: caleb._id,
        isPublished: true,
      },
      {
        title: "What Makes a Good Workspace?",
        content: `
          <h2>A workspace should reduce friction</h2>
          <p>
            Good digital workspaces make it easy to understand what
            matters, where things belong, and what action to take next.
          </p>
          <p>
            Organization should support the work instead of becoming
            another task the user has to manage.
          </p>
        `,
        owner: alex._id,
        isPublished: true,
      },
      {
        title: "Learning Node.js: What Finally Clicked",
        content: `
          <h2>Following the request through the application</h2>
          <p>
            Node.js started making more sense when I stopped viewing
            routes, controllers, middleware, and models as separate
            pieces.
          </p>
          <p>
            Following one request from the browser through each layer
            made the structure much easier to understand.
          </p>
        `,
        owner: alex._id,
        isPublished: true,
      },
      {
        title: "Ideas for a Smarter Home Setup",
        content: `
          <h2>Start with useful automation</h2>
          <p>
            A smart home does not need every possible connected device.
            The most useful systems solve small everyday problems
            reliably.
          </p>
          <p>
            Lighting, networking, security, and simple routines are
            good places to start before adding more complicated
            automation.
          </p>
        `,
        owner: sam._id,
        isPublished: true,
      },
      {
        title: "Small Improvements, Better Projects",
        content: `
          <h2>Polish happens one decision at a time</h2>
          <p>
            Projects rarely become better because of one enormous
            change. Small improvements to spacing, wording, structure,
            validation, and feedback can completely change how finished
            an application feels.
          </p>
        `,
        owner: sam._id,
        isPublished: true,
      },
    ]);

    console.log("Published demo notes created.");

    // --------------------------------------------------
    // ADD DEMO CONTRIBUTIONS
    // --------------------------------------------------

    notes[0].contributions.push(
      {
        content:
          "I think showing the decisions behind a project is especially useful. It gives people something to ask about beyond the finished interface.",
        contributor: alex._id,
      },
      {
        content:
          "A short section about what changed during development could also show how the project evolved.",
        contributor: sam._id,
      },
      {
        content:
          "That would make the project feel more like a case study instead of just a feature list.",
        contributor: caleb._id,
      },
    );

    notes[1].contributions.push({
      content:
        "Clear error messages are a great example of this. They seem small, but they can completely change how approachable an application feels.",
      contributor: sam._id,
    });

    notes[2].contributions.push(
      {
        content:
          "Consistency helps too. If similar actions always look and behave the same way, the interface becomes easier to learn.",
        contributor: caleb._id,
      },
      {
        content:
          "I would add visual hierarchy to that list. Good spacing can communicate structure before someone reads anything.",
        contributor: sam._id,
      },
    );

    notes[3].contributions.push(
      {
        content:
          "Following the request-response cycle helped me understand Express much better too.",
        contributor: caleb._id,
      },
      {
        content:
          "Middleware clicked for me once I started thinking of it as checkpoints the request passes through.",
        contributor: sam._id,
      },
    );

    notes[4].contributions.push({
      content:
        "Reliable networking is probably the foundation people overlook most often when adding smart devices.",
      contributor: caleb._id,
    });

    notes[5].contributions.push(
      {
        content:
          "This applies to code cleanup too. Removing duplication often makes the next improvement easier.",
        contributor: alex._id,
      },
      {
        content:
          "Small UX improvements are also much easier to notice when the core application already works.",
        contributor: caleb._id,
      },
    );

    await Promise.all(notes.map((note) => note.save()));
    console.log("Demo contributions created.");

    // --------------------------------------------------
    // CREATE PRIVATE DEMO NOTES
    // --------------------------------------------------

    await Note.create([
      {
        title: "Ideas I Want to Explore Later",
        content: `
          <p>
            Keep this private while the idea is still taking shape.
            Not every thought needs to be published immediately.
          </p>
        `,
        owner: caleb._id,
        isPublished: false,
      },
      {
        title: "Project Planning Notes",
        content: `
          <p>
            Outline the next steps before turning this into something
            worth sharing with the community.
          </p>
        `,
        owner: alex._id,
        isPublished: false,
      },
    ]);

    console.log("Private demo notes created.");

    // --------------------------------------------------
    // COMPLETE
    // --------------------------------------------------

    console.log("");
    console.log("NoteSpace demo data created successfully.");
    console.log("");
    console.log("Demo accounts:");
    console.log("  caleb / Demo1234");
    console.log("  alex  / Demo1234");
    console.log("  sam   / Demo1234");
  } catch (error) {
    console.error("Error seeding demo data:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDemoData();
