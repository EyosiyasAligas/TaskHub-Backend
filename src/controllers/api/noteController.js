const prisma = require("../../prisma/client");

const getAllNotes = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        createdBy: +req.query.id,
      },
    });

    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        user: {
          connect: {
            id: +req.query.id,
          },
        },
      },
    });
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllNotes, createNote };
