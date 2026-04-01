/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: The patients managing API
 * /signup:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               guardianPhoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               address:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Invalid patient data
 *       500:
 *         description: Internal server error
 * /login:
 *   post:
 *     summary: Login a patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Invalid patient credentials
 *       500:
 *         description: Internal server error
 * /logout:
 *   post:
 *     summary: Logout a patient
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: Patient logged out successfully
 *       500:
 *         description: Internal server error
 *
 * # Therapist endpoints
 * /therapists/signup:
 *   post:
 *     summary: Register a new therapist
 *     tags: [Therapists]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               address:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   street:
 *                     type: string
 *               profession:
 *                 type: string
 *               bio:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               cv:
 *                 type: string
 *                 format: binary
 *               licenseDocument:
 *                 type: string
 *                 format: binary
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Therapist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Therapist'
 *       400:
 *         description: Invalid therapist data
 *       500:
 *         description: Internal server error
 * /therapists/login:
 *   post:
 *     summary: Login a therapist
 *     tags: [Therapists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Therapist logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Therapist'
 *       400:
 *         description: Invalid therapist credentials
 *       500:
 *         description: Internal server error
 * /therapists/logout:
 *   post:
 *     summary: Logout a therapist
 *     tags: [Therapists]
 *     responses:
 *       200:
 *         description: Therapist logged out successfully
 *       500:
 *         description: Internal server error
 * /therapists/verify-email:
 *   get:
 *     summary: Verify a therapist's email
 *     tags: [Therapists]
 *     parameters:
 *       - in: query
 *         name: otp
 *         schema:
 *           type: string
 *         required: true
 *         description: OTP sent to the therapist's email
 *     responses:
 *       200:
 *         description: Therapist's email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         patientId:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         age:
 *           type: integer
 *         profilePicture:
 *           type: string
 *         cloudinaryId:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         guardianPhoneNumber:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *         password:
 *           type: string
 *         userType:
 *           type: string
 *           default: patient
 *     Therapist:
 *       type: object
 *       properties:
 *         therapistId:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         address:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             street:
 *               type: string
 *         profession:
 *           type: string
 *         bio:
 *           type: string
 *         licenseNumber:
 *           type: string
 *         profilePicture:
 *           type: string
 *         cloudinaryId:
 *           type: string
 *         cv:
 *           type: string
 *         cvCloudinaryId:
 *           type: string
 *         licenseDocument:
 *           type: string
 *         password:
 *           type: string
 *         userType:
 *           type: string
 *           default: therapist
 *         isVerified:
 *           type: boolean
 *         otp:
 *           type: string
 *         otpExpires:
 *           type: string
 *           format: date-time
 *         active:
 *           type: boolean
 *           default: true
 */
