const prisma = require("../../prisma/client");

const getAllNotes = async (req, res) => {
  try {
    const { tag, isArchived, isPinned } = req.query;

    const whereClause = {
      createdBy: req.user.id,
    };

    if (isArchived === "true" || isArchived === "false") {
      whereClause.isArchived = isArchived === "true";
    }

    if (isPinned === "true" || isPinned === "false") {
      whereClause.isPinned = isPinned === "true";
    }

    const tagFilter = tag
      ? {
          tags: {
            some: {
              tag: {
                name: tag,
              },
            },
          },
        }
      : null;

    console.log("whereClause", whereClause);

    const notes = await prisma.note.findMany({
      where: {
        ...whereClause,
        ...(tagFilter || {}),
      },
      include: {
        collaborators: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        todoItems: true,
      },
    });

    if (!notes || notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    const formattedNotes = notes.map((note) => ({
      ...note,
      collaborators: note.collaborators.map((collab) => collab.user),
      tags: note.tags.map((noteTag) => noteTag.tag),
    }));

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      notes: formattedNotes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notes",
      error: error.message,
    });
  }
};

const getNoteById = async (req, res) => {
  try {
    const noteId = +req.params.noteId;

    const note = await prisma.note.findFirst({
      where: {
        createdBy: req.user.id,
        id: noteId,
      },
      include: {
        collaborators: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        todoItems: true,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      note: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notes",
      error: error.message,
    });
  }
};

const createNote = async (req, res) => {
  const {
    title,
    content = null,
    todoItems = [],
    collaborators = [],
    tags = [],
    color = "",
    reminder = null,
    isPinned = false,
    isArchived = false,
    isTodo = false,
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newNote = await tx.note.create({
        data: {
          title,
          content,
          createdBy: req.user.id,
          color,
          reminder,
          isPinned,
          isArchived,
          isTodo,
        },
      });

      if (collaborators.length > 0) {
        await tx.collaborator.createMany({
          data: collaborators.map((collaboratorId) => ({
            noteId: newNote.id,
            userId: collaboratorId,
          })),
        });
      }

      if (tags.length > 0) {
        userId = req.user.id;
        for (const tagId of tags) {
          const userTag = await tx.userTag.findUnique({
            where: { userId_tagId: { userId, tagId } },
          });

          if (userTag) {
            await tx.noteTag.create({
              data: {
                noteId: newNote.id,
                tagId,
              },
            });
          }
        }
      }

      if (isTodo && todoItems.length > 0) {
        await tx.todoItem.createMany({
          data: todoItems.map((item) => ({
            task: item.task,
            isCompleted: item.isCompleted || false,
            noteId: newNote.id,
          })),
        });
      }

      return newNote;
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: result,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      success: false,
      message: "Error creating note",
      error: error.message,
    };
  }
};

const editNote = async (req, res) => {
  const {
    title,
    content,
    todoItems,
    collaborators,
    tags,
    color,
    reminder,
    isPinned,
    isArchived,
    isTodo,
  } = req.body;

  const noteId = +req.params.noteId;
  const userId = req.user.id;

  try {
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    const updatedNote = await prisma.$transaction(async (tx) => {
      const updatedFields = {};

      if (title !== undefined) updatedFields.title = title;
      if (content !== undefined) updatedFields.content = content;
      if (color !== undefined) updatedFields.color = color;
      if (reminder !== undefined) updatedFields.reminder = reminder;
      if (isPinned !== undefined) updatedFields.isPinned = isPinned;
      if (isArchived !== undefined) updatedFields.isArchived = isArchived;
      if (isTodo !== undefined) updatedFields.isTodo = isTodo;

      const note = await tx.note.update({
        where: { id: noteId },
        data: updatedFields,
      });

      if (collaborators !== undefined) {
        await tx.collaborator.deleteMany({ where: { noteId } });

        if (collaborators.length > 0) {
          await tx.collaborator.createMany({
            data: collaborators.map((collaboratorId) => ({
              noteId,
              userId: collaboratorId,
            })),
          });
        }
      }

      if (tags !== undefined) {
        await tx.noteTag.deleteMany({ where: { noteId } });

        if (tags.length > 0) {
          for (const tagId of tags) {
            const userTag = await tx.userTag.findUnique({
              where: { userId_tagId: { userId, tagId } },
            });

            if (userTag) {
              await tx.noteTag.create({
                data: {
                  noteId,
                  tagId,
                },
              });
            }
          }
        }
      }

      if (todoItems !== undefined) {
        await tx.todoItem.deleteMany({ where: { noteId } });

        if (todoItems.length > 0) {
          await tx.todoItem.createMany({
            data: todoItems.map((item) => ({
              task: item.task,
              isCompleted: item.isCompleted || false,
              noteId,
            })),
          });
        }
      }

      return note;
    });

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating note",
      error: error.message,
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const noteId = +req.params.noteId;

    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    await prisma.note.delete({
      where: { id: +noteId },
    });

    res
      .status(200)
      .json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting note",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  editNote,
  deleteNote,
};
