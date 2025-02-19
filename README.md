# GradePoint - Online Examination System  

**GradePoint** is a cutting-edge online examination platform designed to revolutionize the way educational institutions and organizations conduct exams. Built with modern technologies, GradePoint offers a seamless, secure, and scalable solution for creating, managing, and taking exams online. Whether you're an educator, student, or administrator, GradePoint provides a user-friendly experience with powerful features to meet your needs.  

---

## ✨ Key Features  

- **Secure Authentication**: Role-based access control powered by **Auth.js** ensures only authorized users can access the system.  
- **Exam Management**: Easily create, schedule, and manage exams with customizable settings.  
- **Real-Time Exam Interface**: A responsive and intuitive interface for students to take exams smoothly.  
- **Automated Grading**: Instant grading for objective questions and support for manual grading of subjective answers.  
- **Performance Analytics**: Detailed reports and insights for students and educators to track progress and performance.  
- **Modern UI**: A sleek and responsive design built with **Tailwind CSS**, **Aceternity UI**, and **shadcn** components.  
- **Scalable Backend**: Efficient data handling with **Prisma** and **PostgreSQL** for reliable performance.  

---

## 🛠️ Technologies Used  

- **Frontend**: Next.js, Tailwind CSS, Aceternity UI, shadcn  
- **Backend**: Next.js API Routes  
- **Authentication**: Auth.js  
- **Database**: PostgreSQL  
- **ORM**: Prisma  
- **Deployment**: Vercel (recommended)  

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js (v18 or higher)  
- PostgreSQL database  
- Git  

### Installation  
1. **Clone the repository**:  
   ```bash  
   git clone https://github.com/your-username/GradePoint.git  
   cd GradePoint  
   ```  

2. **Install dependencies**:  
   ```bash  
   npm install  
   ```  

3. **Set up environment variables**:  
   Create a `.env` file in the root directory and add the following:  
   ```env  
   DATABASE_URL="postgresql://user:password@localhost:5432/gradepoint"  
   NEXTAUTH_SECRET="your-secret-key"  
   NEXTAUTH_URL="http://localhost:3000"  
   ```  

4. **Run database migrations**:  
   ```bash  
   npx prisma migrate dev --name init  
   ```  

5. **Start the development server**:  
   ```bash  
   npm run dev  
   ```  

6. **Open the application**:  
   Visit `http://localhost:3000` in your browser.  

---

## 📂 Folder Structure  

```  
GradePoint/  
├── .git/                # Git version control folder  
├── .next/               # Next.js build output  
├── app/                 # Next.js app router and pages  
├── components/          # Reusable UI components  
├── hooks/               # Custom React hooks  
├── lib/                 # Utility functions and libraries  
├── node_modules/        # Project dependencies  
├── prisma/              # Prisma schema and migrations  
├── public/              # Static assets (images, fonts, etc.)  
├── .env                 # Environment variables  
├── .env.local           # Local environment variables  
├── .gitignore           # Git ignore file  
├── auth.ts              # Authentication configuration  
├── components.json      # Configuration for UI components  
├── eslint.config.mjs    # ESLint configuration  
├── middleware.ts        # Auth middleware  
├── next.config.ts       # Next.js configuration  
├── next-env.d.ts        # Next.js TypeScript declarations  
├── package.json         # Project dependencies  
├── package-lock.json    # Locked project dependencies  
├── postcss.config.mjs   # PostCSS configuration  
├── README.md            # Project documentation  
├── tailwind.config.ts   # Tailwind CSS configuration  
└── tsconfig.json        # TypeScript configuration  
```  

---

## 📜 License  

GradePoint is a proprietary software. All rights reserved. Unauthorized use, reproduction, or distribution is strictly prohibited.  

---

## 📞 Support  

For inquiries or support, please contact me at **tanuvnair@gmail.com**.  

---

GradePoint is designed to make online examinations efficient, secure, and hassle-free. Whether you're an educator or a student, GradePoint is here to empower your learning journey. 🌟
