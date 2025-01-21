const prisma = require("../../prisma/client");

const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.userTag.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tags || tags.length === 0) {
      return res.status(404).json({ message: "No tags found" });
    }

    const formattedTags = tags.map((tag) => tag.tag);

    res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      data: formattedTags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tags",
      error: error.message,
    });
  }
};

const getTagById = async (req, res) => {
  try {
    const tagId = +req.params.tagId;

    const tag = await prisma.userTag.findFirst({
      where: {
        id: tagId,
        userId: req.user.id,
      },
      select: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({
      success: true,
      message: "Tag fetched successfully",
      data: tag.tag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tag",
      error: error.message,
    });
  }
};

const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    ///first check if there is a tag with the name
    const tag = await prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (tag) {
      const userTag = await prisma.userTag.findFirst({
        where: {
          userId: req.user.id,
          tagId: tag.id,
        },
      });

      if (userTag) {
        return res.status(200).json({
          message: "Already exists",
        });
      }
      const result = await prisma.userTag.create({
        data: {
          userId: req.user.id,
          tagId: tag.id,
        },
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: result.tag,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const tag = await tx.tag.create({
        data: {
          name: name,
        },
      });

      if (tag) {
        await tx.userTag.create({
          data: {
            userId: req.user.id,
            tagId: tag.id,
          },
        });
      }

      return tag;
    });

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating tag",
      error: error.message,
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const tagId = +req.params.tagId;
    const { name } = req.body;

    const tag = await prisma.userTag.findFirst({
      where: {
        tagId: tagId,
        userId: req.user.id,
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const updatedTag = await prisma.tag.update({
      where: {
        id: tag.tagId,
      },
      data: {
        name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: updatedTag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating tag",
      error: error.message,
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tagId = +req.params.tagId;

    const tag = await prisma.userTag.findFirst({
      where: {
        tagId: tagId,
        userId: req.user.id,
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    await prisma.userTag.delete({
      where: {
        id: tag.id,
      },
    });

    /// check if the tag is not used by any other user
    const userTag = await prisma.userTag.findFirst({
      where: {
        tagId: tagId,
      },
    });

    if (!userTag) {
      await prisma.tag.delete({
        where: {
          id: tagId,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting tag",
      error: error.message,
    });
  }
};

module.exports = { getAllTags, getTagById, createTag, updateTag, deleteTag };
