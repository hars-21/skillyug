"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create course tags
    const tags = await Promise.all([
        prisma.courseTag.upsert({
            where: { name: 'Beginner Friendly' },
            update: {},
            create: { name: 'Beginner Friendly', color: '#10B981' }
        }),
        prisma.courseTag.upsert({
            where: { name: 'Popular' },
            update: {},
            create: { name: 'Popular', color: '#F59E0B' }
        }),
        prisma.courseTag.upsert({
            where: { name: 'Hands-on' },
            update: {},
            create: { name: 'Hands-on', color: '#3B82F6' }
        }),
        prisma.courseTag.upsert({
            where: { name: 'Certification' },
            update: {},
            create: { name: 'Certification', color: '#8B5CF6' }
        }),
        prisma.courseTag.upsert({
            where: { name: 'Project-based' },
            update: {},
            create: { name: 'Project-based', color: '#EF4444' }
        })
    ]);
    console.log('✅ Created course tags');
    // Create sample mentor user
    const mentor = await prisma.userProfile.upsert({
        where: { email: 'mentor@skillyug.com' },
        update: {},
        create: {
            id: 'mentor-uuid-1',
            email: 'mentor@skillyug.com',
            fullName: 'Dr. Sarah Johnson',
            userType: prisma_1.UserType.MENTOR,
            emailVerified: true
        }
    });
    console.log('✅ Created mentor user');
    // Create sample admin user
    const admin = await prisma.userProfile.upsert({
        where: { email: 'admin@skillyug.com' },
        update: {},
        create: {
            id: 'admin-uuid-1',
            email: 'admin@skillyug.com',
            fullName: 'Admin User',
            userType: prisma_1.UserType.ADMIN,
            emailVerified: true
        }
    });
    console.log('✅ Created admin user');
    // Create sample courses
    const courses = await Promise.all([
        prisma.course.upsert({
            where: { id: 'course-1' },
            update: {},
            create: {
                id: 'course-1',
                courseName: 'Complete JavaScript Mastery',
                token: 150,
                price: 2999.99,
                imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
                instructor: 'Dr. Sarah Johnson',
                description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks.',
                category: prisma_1.Category.PROGRAMMING,
                difficulty: prisma_1.Difficulty.BEGINNER,
                duration: 40,
                language: 'English',
                prerequisites: [],
                featured: true,
                mentorId: mentor.id,
                tags: {
                    connect: [
                        { id: tags[0].id }, // Beginner Friendly
                        { id: tags[1].id }, // Popular
                        { id: tags[2].id } // Hands-on
                    ]
                }
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-2' },
            update: {},
            create: {
                id: 'course-2',
                courseName: 'React Development Bootcamp',
                token: 200,
                price: 3999.99,
                imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
                instructor: 'Dr. Sarah Johnson',
                description: 'Build modern web applications with React, including hooks, context, and state management.',
                category: prisma_1.Category.DEVELOPMENT,
                difficulty: prisma_1.Difficulty.INTERMEDIATE,
                duration: 60,
                language: 'English',
                prerequisites: ['JavaScript Fundamentals'],
                featured: true,
                mentorId: mentor.id,
                tags: {
                    connect: [
                        { id: tags[1].id }, // Popular
                        { id: tags[2].id }, // Hands-on
                        { id: tags[4].id } // Project-based
                    ]
                }
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-3' },
            update: {},
            create: {
                id: 'course-3',
                courseName: 'DevOps Fundamentals',
                token: 250,
                price: 4999.99,
                imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
                instructor: 'Dr. Sarah Johnson',
                description: 'Learn Docker, Kubernetes, CI/CD, and cloud deployment strategies.',
                category: prisma_1.Category.DEVOPS,
                difficulty: prisma_1.Difficulty.ADVANCED,
                duration: 50,
                language: 'English',
                prerequisites: ['Linux Basics', 'Programming Experience'],
                featured: false,
                mentorId: mentor.id,
                tags: {
                    connect: [
                        { id: tags[2].id }, // Hands-on
                        { id: tags[3].id }, // Certification
                        { id: tags[4].id } // Project-based
                    ]
                }
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-4' },
            update: {},
            create: {
                id: 'course-4',
                courseName: 'Data Science with Python',
                token: 300,
                price: 5999.99,
                imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
                instructor: 'Dr. Sarah Johnson',
                description: 'Complete data science course covering Python, pandas, NumPy, matplotlib, and machine learning.',
                category: prisma_1.Category.DATA_SCIENCE,
                difficulty: prisma_1.Difficulty.INTERMEDIATE,
                duration: 80,
                language: 'English',
                prerequisites: ['Python Basics', 'Mathematics'],
                featured: true,
                mentorId: mentor.id,
                tags: {
                    connect: [
                        { id: tags[1].id }, // Popular
                        { id: tags[2].id }, // Hands-on
                        { id: tags[3].id }, // Certification
                        { id: tags[4].id } // Project-based
                    ]
                }
            }
        })
    ]);
    console.log('✅ Created sample courses');
    // Create lessons for the first course
    const lessons = await Promise.all([
        prisma.lesson.create({
            data: {
                title: 'Introduction to JavaScript',
                description: 'Learn the basics of JavaScript programming language.',
                content: 'JavaScript is a versatile programming language...',
                videoUrl: 'https://example.com/video1',
                duration: 30,
                order: 1,
                isPreview: true,
                courseId: courses[0].id
            }
        }),
        prisma.lesson.create({
            data: {
                title: 'Variables and Data Types',
                description: 'Understanding JavaScript variables and data types.',
                content: 'Variables in JavaScript can hold different types of data...',
                videoUrl: 'https://example.com/video2',
                duration: 45,
                order: 2,
                isPreview: false,
                courseId: courses[0].id
            }
        }),
        prisma.lesson.create({
            data: {
                title: 'Functions and Scope',
                description: 'Learn about JavaScript functions and variable scope.',
                content: 'Functions are reusable blocks of code...',
                videoUrl: 'https://example.com/video3',
                duration: 50,
                order: 3,
                isPreview: false,
                courseId: courses[0].id
            }
        })
    ]);
    console.log('✅ Created sample lessons');
    // Create sample student user
    const student = await prisma.userProfile.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            id: 'student-uuid-1',
            email: 'student@example.com',
            fullName: 'John Doe',
            userType: prisma_1.UserType.STUDENT,
            emailVerified: true
        }
    });
    console.log('✅ Created sample student');
    // Create sample enrollment
    const enrollment = await prisma.enrollment.create({
        data: {
            userId: student.id,
            courseId: courses[0].id,
            progressPercent: 33.33
        }
    });
    console.log('✅ Created sample enrollment');
    // Create lesson progress
    await prisma.lessonProgress.create({
        data: {
            enrollmentId: enrollment.id,
            lessonId: lessons[0].id,
            completed: true,
            timeSpent: 25
        }
    });
    console.log('✅ Created lesson progress');
    // Create sample purchase
    await prisma.userPurchase.create({
        data: {
            userId: student.id,
            courseId: courses[0].id,
            paymentRef: 'pay_mock_123456789',
            purchasePrice: courses[0].price
        }
    });
    console.log('✅ Created sample purchase');
    // Create sample review
    await prisma.review.create({
        data: {
            userId: student.id,
            courseId: courses[0].id,
            rating: 5,
            comment: 'Excellent course! Very well structured and easy to follow. The instructor explains concepts clearly.'
        }
    });
    console.log('✅ Created sample review');
    // Create analytics data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await Promise.all([
        prisma.analytics.upsert({
            where: {
                date_metric: {
                    date: today,
                    metric: 'DAILY_ACTIVE_USERS'
                }
            },
            update: {},
            create: {
                date: today,
                metric: 'DAILY_ACTIVE_USERS',
                value: 1250
            }
        }),
        prisma.analytics.upsert({
            where: {
                date_metric: {
                    date: today,
                    metric: 'NEW_REGISTRATIONS'
                }
            },
            update: {},
            create: {
                date: today,
                metric: 'NEW_REGISTRATIONS',
                value: 25
            }
        }),
        prisma.analytics.upsert({
            where: {
                date_metric: {
                    date: today,
                    metric: 'REVENUE'
                }
            },
            update: {},
            create: {
                date: today,
                metric: 'REVENUE',
                value: 15999.96
            }
        })
    ]);
    console.log('✅ Created analytics data');
    console.log('🎉 Database seed completed successfully!');
    // Print summary
    const coursesCount = await prisma.course.count();
    const usersCount = await prisma.userProfile.count();
    const enrollmentsCount = await prisma.enrollment.count();
    console.log('\n📊 Seed Summary:');
    console.log(`- Users: ${usersCount}`);
    console.log(`- Courses: ${coursesCount}`);
    console.log(`- Enrollments: ${enrollmentsCount}`);
    console.log(`- Course Tags: ${tags.length}`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
