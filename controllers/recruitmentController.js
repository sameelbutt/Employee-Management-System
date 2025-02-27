// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // Create a new recruitment request
// const createRecruitment = async (req, res) => {
//   const { title, description, departmentId, positionId } = req.body;

//   try {
//     const recruitment = await prisma.recruitment.create({
//       data: {
//         title,
//         description,
//         departmentId,
//         positionId,
//         status: "Open", // Default status
//       },
//     });
//     res.status(201).json(recruitment);
//   } catch (error) {
//     res.status(400).json({ error: "Failed to create recruitment request" });
//   }
// };

// // Get all recruitment requests
// const getAllRecruitments = async (req, res) => {
//   try {
//     const recruitments = await prisma.recruitment.findMany({
//       include: {
//         department: true,
//         position: true,
//         jobApplications: true,
//       },
//     });
//     res.status(200).json(recruitments);
//   } catch (error) {
//     res.status(400).json({ error: "Failed to fetch recruitment requests" });
//   }
// };

// // Update recruitment status
// const updateRecruitmentStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   try {
//     const updatedRecruitment = await prisma.recruitment.update({
//       where: { id: parseInt(id) },
//       data: { status },
//     });
//     res.status(200).json(updatedRecruitment);
//   } catch (error) {
//     res.status(400).json({ error: "Failed to update recruitment status" });
//   }
// };

// module.exports = {
//   createRecruitment,
//   getAllRecruitments,
//   updateRecruitmentStatus,
// };