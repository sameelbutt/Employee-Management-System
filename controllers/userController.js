const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getEmployees = async (req, res) => {
  try {
    const { departmentId, positionId, role } = req.query;

    
    const where = {};
    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }
    if (positionId) {
      where.positionId = parseInt(positionId);
    }
    if (role) {
      const rolesArray = role.split(",");
      where.role = { in: rolesArray };
    }

  
    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        hireDate: true,
        status: true,
        departmentId: true,
        positionId: true,
        salary: true,
        role: true,
        bankAccount: true
      },
    });

    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error in getEmployees:", error);
    return res.status(500).json({ error: "Error fetching employees" });
  }
};


const updateEmployees = async (req, res) => {
  const { userId } = req.params;
  const{role}=req.user;
  if(role!=="HR"){
    return res.status(403).json({ message: "You are not authorized to perform this action" });
  }
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    address,
    hireDate,
    status,
    departmentId,
    positionId,
    salary,
    role: employeeRole,
    bankAccount
  } = req.body;

  try {
    
    const employee = await prisma.employee.update({
      where: { id: parseInt(userId) }, 
      data: {
        firstName,
        lastName,
        phoneNumber,
        address,
        hireDate,
        status,
        departmentId,
        positionId,
        salary: salary ? Number(salary) : undefined,
        role: employeeRole,
        bankAccount
      }
    });

    return res.status(200).json(employee);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deleteEmployees = async (req, res) => {
  const {userId}=req.params;
  const {role}=req.user;
  if(!role==="HR"){
    return res.status(403).json({message:"You are not authorized to perform this action"});
  }
   if(!userId){
     return res.status(400).json({message:"User ID is required"});
   } 
   try{
const employee=await prisma.employee.delete({
  where:{id:parseInt(userId)},
 

})
return res.status(200).json({message:"Employee deleted successfully"});
   }catch(error){
      console.error("Error in deleteEmployees:",error);
      return res.status(500).json({error:"Error deleting employees"})

   }
  
};

module.exports = {
  getEmployees,
  updateEmployees,
  deleteEmployees
};