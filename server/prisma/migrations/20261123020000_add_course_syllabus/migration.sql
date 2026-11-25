-- Faculty-editable, publishable syllabus per assigned class (subject + section).
-- A template table keeps the supplied 5th-semester syllabi as the dynamic default
-- for new sections; CourseSyllabus stores each class's live edits and progress.

CREATE TABLE IF NOT EXISTS "SyllabusTemplate" (
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "modules" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SyllabusTemplate_pkey" PRIMARY KEY ("subjectCode")
);

CREATE TABLE IF NOT EXISTS "CourseSyllabus" (
    "id" TEXT NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text),
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "facultyId" TEXT,
    "modules" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseSyllabus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CourseSyllabus_subjectId_sectionId_key"
    ON "CourseSyllabus"("subjectId", "sectionId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseSyllabus_subjectId_fkey') THEN
        ALTER TABLE "CourseSyllabus"
        ADD CONSTRAINT "CourseSyllabus_subjectId_fkey"
        FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseSyllabus_sectionId_fkey') THEN
        ALTER TABLE "CourseSyllabus"
        ADD CONSTRAINT "CourseSyllabus_sectionId_fkey"
        FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseSyllabus_facultyId_fkey') THEN
        ALTER TABLE "CourseSyllabus"
        ADD CONSTRAINT "CourseSyllabus_facultyId_fkey"
        FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;

-- Computer Vision (BAI501G)
INSERT INTO "SyllabusTemplate" ("subjectCode", "subjectName", "modules")
VALUES ('BAI501G', 'Computer Vision', '
{
  "modules": [
    {
      "id": "cv-m1",
      "title": "Fundamentals of Digital Imaging and Transformations",
      "hours": "10 Hours",
      "description": "What is Digital Image Processing? Fundamentals of Digital Image Processing, Components of an Image Processing System, Elements of Visual Perception, Image sensing and acquisition, Image Sampling and Quantization, Some Basic Relationships between Pixels, Some Basic Intensity Transformation Functions, Histogram Processing, Color Spaces.",
      "topics": [
        { "id": "cv-m1-t1", "name": "What is Digital Image Processing?" },
        { "id": "cv-m1-t2", "name": "Fundamentals of Digital Image Processing" },
        { "id": "cv-m1-t3", "name": "Components of an Image Processing System" },
        { "id": "cv-m1-t4", "name": "Elements of Visual Perception" },
        { "id": "cv-m1-t5", "name": "Image sensing and acquisition" },
        { "id": "cv-m1-t6", "name": "Image Sampling and Quantization" },
        { "id": "cv-m1-t7", "name": "Some Basic Relationships between Pixels" },
        { "id": "cv-m1-t8", "name": "Some Basic Intensity Transformation Functions" },
        { "id": "cv-m1-t9", "name": "Histogram Processing" },
        { "id": "cv-m1-t10", "name": "Color Spaces" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cv-m2",
      "title": "Filtering, Enhancement and Feature Extraction",
      "hours": "10 Hours",
      "description": "Spatial and frequency domain filters, noise models, image restoration and feature detection/description.",
      "topics": [
        { "id": "cv-m2-t1", "name": "Spatial Domain Filters (Smoothing and Sharpening)" },
        { "id": "cv-m2-t2", "name": "Frequency Domain Filters (Fourier Transform Concepts, Smoothing, Sharpening)" },
        { "id": "cv-m2-t3", "name": "Noise Models" },
        { "id": "cv-m2-t4", "name": "Image Restoration – Overview" },
        { "id": "cv-m2-t5", "name": "Feature detection and description" },
        { "id": "cv-m2-t6", "name": "Harris Corner Detector" },
        { "id": "cv-m2-t7", "name": "SIFT" },
        { "id": "cv-m2-t8", "name": "HOG" },
        { "id": "cv-m2-t9", "name": "ORB" },
        { "id": "cv-m2-t10", "name": "Feature matching" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cv-m3",
      "title": "Image Segmentation, Morphological Processing and 3D Vision",
      "hours": "10 Hours",
      "description": "Segmentation, morphology, camera calibration and 3D vision including Zhang''s method and RANSAC.",
      "topics": [
        { "id": "cv-m3-t1", "name": "Fundamentals of Image Segmentation" },
        { "id": "cv-m3-t2", "name": "Thresholding and Otsu''s Method" },
        { "id": "cv-m3-t3", "name": "Region-Based Segmentation" },
        { "id": "cv-m3-t4", "name": "Watershed Segmentation" },
        { "id": "cv-m3-t5", "name": "K-Means Segmentation" },
        { "id": "cv-m3-t6", "name": "Morphological Processing: Structuring Elements" },
        { "id": "cv-m3-t7", "name": "Erosion and Dilation" },
        { "id": "cv-m3-t8", "name": "Opening and Closing" },
        { "id": "cv-m3-t9", "name": "Hit-or-Miss Transform (overview)" },
        { "id": "cv-m3-t10", "name": "Boundary Extraction and Region Filling" },
        { "id": "cv-m3-t11", "name": "Camera Calibration & 3D Vision: Pinhole camera model" },
        { "id": "cv-m3-t12", "name": "Perspective Projection and Geometric Transformation" },
        { "id": "cv-m3-t13", "name": "Intrinsic and Extrinsic Parameters" },
        { "id": "cv-m3-t14", "name": "Radial Distortion and Correction" },
        { "id": "cv-m3-t15", "name": "Camera calibration using Zhang''s method (checkerboard pattern)" },
        { "id": "cv-m3-t16", "name": "Vanishing points" },
        { "id": "cv-m3-t17", "name": "RANSAC for robust model estimation" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cv-m4",
      "title": "Object Detection, Recognition & Scene Understanding",
      "hours": "10 Hours",
      "description": "Object detection/recognition pipelines, OCR case study, scene understanding and video analytics.",
      "topics": [
        { "id": "cv-m4-t1", "name": "Face detection – Viola-Jones algorithm, cascade classifier" },
        { "id": "cv-m4-t2", "name": "Pedestrian detection – HOG + SVM pipeline" },
        { "id": "cv-m4-t3", "name": "Sliding window detection" },
        { "id": "cv-m4-t4", "name": "Object detection using YOLO – confidence threshold, NMS, mAP" },
        { "id": "cv-m4-t5", "name": "Face recognition – Eigenfaces, PCA-based representation" },
        { "id": "cv-m4-t6", "name": "Category recognition – Bag of Visual Words (concept)" },
        { "id": "cv-m4-t7", "name": "OCR – case study" },
        { "id": "cv-m4-t8", "name": "Scene classification" },
        { "id": "cv-m4-t9", "name": "Content-based image retrieval (CBIR)" },
        { "id": "cv-m4-t10", "name": "Optical flow – Lucas-Kanade sparse optical flow" },
        { "id": "cv-m4-t11", "name": "Application: object tracking" }
      ],
      "completedTopicIds": [],
      "progress": 0
    }
  ]
}
')
ON CONFLICT ("subjectCode") DO UPDATE SET
    "subjectName" = EXCLUDED."subjectName",
    "modules" = EXCLUDED."modules",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Automata Theory and Computability (BAI503T)
INSERT INTO "SyllabusTemplate" ("subjectCode", "subjectName", "modules")
VALUES ('BAI503T', 'Automata Theory and Computability', '
{
  "modules": [
    {
      "id": "atc-m1",
      "title": "Introduction to Automata Theory and Finite Automata",
      "hours": "10 Hours",
      "description": "Overview and applications, central concepts, DFA/NFA equivalence, text search and epsilon transitions.",
      "topics": [
        { "id": "atc-m1-t1", "name": "Overview and Applications of Automata Theory" },
        { "id": "atc-m1-t2", "name": "The Central Concepts of Automata Theory" },
        { "id": "atc-m1-t3", "name": "Deterministic Finite Automata (DFA)" },
        { "id": "atc-m1-t4", "name": "Nondeterministic Finite Automata (NFA)" },
        { "id": "atc-m1-t5", "name": "Equivalence of Deterministic and Nondeterministic Finite Automata" },
        { "id": "atc-m1-t6", "name": "Application of Finite Automata: Text Search" },
        { "id": "atc-m1-t7", "name": "Finite Automata with Epsilon-transitions" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "atc-m2",
      "title": "Regular Expressions and Properties of Regular Languages",
      "hours": "10 Hours",
      "description": "Regular expressions, applications, pumping/closure properties and minimization of automata.",
      "topics": [
        { "id": "atc-m2-t1", "name": "Regular Expressions" },
        { "id": "atc-m2-t2", "name": "Finite Automata and Regular Expressions" },
        { "id": "atc-m2-t3", "name": "Applications of Regular Expressions" },
        { "id": "atc-m2-t4", "name": "Proving Languages Not to Be Regular" },
        { "id": "atc-m2-t5", "name": "Closure Properties of Regular Languages" },
        { "id": "atc-m2-t6", "name": "Equivalence and Minimization of Automata" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "atc-m3",
      "title": "Context-Free Grammars, Pushdown Automata and CFL Properties",
      "hours": "10 Hours",
      "description": "CFGs, parse trees, ambiguity, PDA/CFG equivalence, normal forms, pumping lemma and closure properties.",
      "topics": [
        { "id": "atc-m3-t1", "name": "Context-Free Grammars" },
        { "id": "atc-m3-t2", "name": "Parse Trees" },
        { "id": "atc-m3-t3", "name": "Applications of Context-Free Grammars" },
        { "id": "atc-m3-t4", "name": "Ambiguity in Grammars and Languages" },
        { "id": "atc-m3-t5", "name": "Pushdown Automata: Definition" },
        { "id": "atc-m3-t6", "name": "The Languages of a PDA" },
        { "id": "atc-m3-t7", "name": "Design of PDA" },
        { "id": "atc-m3-t8", "name": "Equivalence of PDA''s and CFG''s – Conversion both ways" },
        { "id": "atc-m3-t9", "name": "Deterministic Pushdown Automata" },
        { "id": "atc-m3-t10", "name": "Normal Forms for Context-Free Grammars" },
        { "id": "atc-m3-t11", "name": "The Pumping Lemma for Context-Free Languages" },
        { "id": "atc-m3-t12", "name": "Closure Properties of Context-Free Languages" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "atc-m4",
      "title": "Turing Machines, Decidability and Complexity",
      "hours": "10 Hours",
      "description": "TM model and variants, undecidability, Post Correspondence Problem, P/NP, quantum computation and Church-Turing thesis.",
      "topics": [
        { "id": "atc-m4-t1", "name": "Turing Machine Model" },
        { "id": "atc-m4-t2", "name": "Representation of Turing Machine" },
        { "id": "atc-m4-t3", "name": "Language Acceptability by Turing Machine" },
        { "id": "atc-m4-t4", "name": "Design of Turing Machines" },
        { "id": "atc-m4-t5", "name": "Techniques for Turing Machine Construction" },
        { "id": "atc-m4-t6", "name": "Nondeterministic Turing Machine" },
        { "id": "atc-m4-t7", "name": "Multi Tape Turing Machine" },
        { "id": "atc-m4-t8", "name": "Linear Bounded Automaton" },
        { "id": "atc-m4-t9", "name": "Decidability and Decidable Languages" },
        { "id": "atc-m4-t10", "name": "Undecidable Languages" },
        { "id": "atc-m4-t11", "name": "Halting Problem of Turing Machine" },
        { "id": "atc-m4-t12", "name": "The Post Correspondence Problem" },
        { "id": "atc-m4-t13", "name": "Growth Rate of Functions" },
        { "id": "atc-m4-t14", "name": "The Classes of P and NP" },
        { "id": "atc-m4-t15", "name": "Quantum Computation – Quantum Computers" },
        { "id": "atc-m4-t16", "name": "Church-Turing Thesis" }
      ],
      "completedTopicIds": [],
      "progress": 0
    }
  ]
}
')
ON CONFLICT ("subjectCode") DO UPDATE SET
    "subjectName" = EXCLUDED."subjectName",
    "modules" = EXCLUDED."modules",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Computer Network and its Application (BAI502G)
INSERT INTO "SyllabusTemplate" ("subjectCode", "subjectName", "modules")
VALUES ('BAI502G', 'Computer Network and its Application', '
{
  "modules": [
    {
      "id": "cn-m1",
      "title": "Introduction to Networks and Physical Layer",
      "hours": "10 Hours",
      "description": "Network hardware/software, reference models, guided and wireless transmission media.",
      "topics": [
        { "id": "cn-m1-t1", "name": "Network hardware" },
        { "id": "cn-m1-t2", "name": "Network software" },
        { "id": "cn-m1-t3", "name": "Reference models" },
        { "id": "cn-m1-t4", "name": "Guided transmission media" },
        { "id": "cn-m1-t5", "name": "Wireless transmission" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cn-m2",
      "title": "Data Link Layer and MAC Sublayer",
      "hours": "10 Hours",
      "description": "DLL design issues, error control, sliding window protocols, channel allocation and multiple access.",
      "topics": [
        { "id": "cn-m2-t1", "name": "Design issues of the Data Link Layer" },
        { "id": "cn-m2-t2", "name": "Error detection and correction" },
        { "id": "cn-m2-t3", "name": "Sliding window protocols" },
        { "id": "cn-m2-t4", "name": "The channel allocation problem" },
        { "id": "cn-m2-t5", "name": "Multiple access protocols" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cn-m3",
      "title": "Network Layer and Transport Layer",
      "hours": "10 Hours",
      "description": "Routing algorithms, hierarchy and transport services, protocols and congestion control.",
      "topics": [
        { "id": "cn-m3-t1", "name": "Network Layer Design Issues" },
        { "id": "cn-m3-t2", "name": "Link-State (LS) Routing Algorithm" },
        { "id": "cn-m3-t3", "name": "Distance-Vector (DV) Routing Algorithm" },
        { "id": "cn-m3-t4", "name": "Hierarchical Routing" },
        { "id": "cn-m3-t5", "name": "The Transport Service" },
        { "id": "cn-m3-t6", "name": "Elements of transport protocols" },
        { "id": "cn-m3-t7", "name": "Congestion control" },
        { "id": "cn-m3-t8", "name": "The internet transport protocols" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "cn-m4",
      "title": "Application Layer and AI in Computer Networks",
      "hours": "10 Hours",
      "description": "Web/HTTP, email, DNS and AI applications in SDN, routing, security and network management.",
      "topics": [
        { "id": "cn-m4-t1", "name": "Principles of Network Applications" },
        { "id": "cn-m4-t2", "name": "The Web and HTTP" },
        { "id": "cn-m4-t3", "name": "Electronic Mail in the Internet" },
        { "id": "cn-m4-t4", "name": "DNS – The Internet''s Directory Service" },
        { "id": "cn-m4-t5", "name": "Introduction to AI and its relevance to networking" },
        { "id": "cn-m4-t6", "name": "AI in SDN" },
        { "id": "cn-m4-t7", "name": "Self-healing networks" },
        { "id": "cn-m4-t8", "name": "Heuristic search for intelligent routing" },
        { "id": "cn-m4-t9", "name": "Knowledge representation for network security and management" }
      ],
      "completedTopicIds": [],
      "progress": 0
    }
  ]
}
')
ON CONFLICT ("subjectCode") DO UPDATE SET
    "subjectName" = EXCLUDED."subjectName",
    "modules" = EXCLUDED."modules",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Machine Learning (BAI504T)
INSERT INTO "SyllabusTemplate" ("subjectCode", "subjectName", "modules")
VALUES ('BAI504T', 'Machine Learning', '
{
  "modules": [
    {
      "id": "ml-m1",
      "title": "Introduction to Machine Learning and Basic Supervised Learning",
      "hours": "10 Hours",
      "description": "ML types, pipeline, linear regression, classification basics and cross-validation with textbook references.",
      "topics": [
        { "id": "ml-m1-t1", "name": "Introduction to Machine Learning: Definition and Types (Supervised, Unsupervised, Reinforcement)" },
        { "id": "ml-m1-t2", "name": "Machine Learning pipeline: Data collection, Preprocessing, Model training, Evaluation" },
        { "id": "ml-m1-t3", "name": "Regression Problems: Simple Linear Regression" },
        { "id": "ml-m1-t4", "name": "Multiple Linear Regression" },
        { "id": "ml-m1-t5", "name": "Classification Problems: Logistic Regression" },
        { "id": "ml-m1-t6", "name": "K-Nearest Neighbors (KNN)" },
        { "id": "ml-m1-t7", "name": "Naive Bayes Classifier" },
        { "id": "ml-m1-t8", "name": "Bias-Variance Trade-off and Cross-validation" },
        { "id": "ml-m1-t9", "name": "Leave-One-Out (LOO) and K-folds cross-validation" },
        { "id": "ml-m1-t10", "name": "Textbook 1: Chapter 1 (Sections 1.1–1.4)" },
        { "id": "ml-m1-t11", "name": "Textbook 1: Chapter 2 (Sections 2.1–2.6)" },
        { "id": "ml-m1-t12", "name": "Textbook 1: Chapter 3 (Sections 3.1–3.6)" },
        { "id": "ml-m1-t13", "name": "Textbook 1: Chapter 4 (Sections 4.1–4.5)" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "ml-m2",
      "title": "Advanced Regression, Classification and Evaluation",
      "hours": "10 Hours",
      "description": "Ridge, LDA, SVM, decision trees, performance metrics, regularization and hyperparameter tuning.",
      "topics": [
        { "id": "ml-m2-t1", "name": "Ridge Regression" },
        { "id": "ml-m2-t2", "name": "Linear Discriminant Analysis (LDA)" },
        { "id": "ml-m2-t3", "name": "Support Vector Machine (SVM)" },
        { "id": "ml-m2-t4", "name": "Decision Trees" },
        { "id": "ml-m2-t5", "name": "Performance Metrics: Precision, Recall, F1-Score, ROC Curve, AUC" },
        { "id": "ml-m2-t6", "name": "Model Optimization: Regularization (L1, L2)" },
        { "id": "ml-m2-t7", "name": "Hyperparameter tuning" },
        { "id": "ml-m2-t8", "name": "Textbook 1: Chapter 4 (Sections 4.6–4.8)" },
        { "id": "ml-m2-t9", "name": "Textbook 1: Chapter 5 (Sections 5.1–5.6)" },
        { "id": "ml-m2-t10", "name": "Textbook 1: Chapter 6 (Sections 6.1–6.3)" },
        { "id": "ml-m2-t11", "name": "Textbook 2: Chapter 5 (Sections 5.1–5.5)" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "ml-m3",
      "title": "Clustering and Dimensionality Reduction",
      "hours": "10 Hours",
      "description": "K-Means, K-Medoid, hierarchical clustering, dendrograms, PCA and textbook references.",
      "topics": [
        { "id": "ml-m3-t1", "name": "K-Means Clustering: Centroid-based clustering, Distance metrics, Elbow method" },
        { "id": "ml-m3-t2", "name": "K-Medoid Clustering: Difference from K-Means, appropriate use cases" },
        { "id": "ml-m3-t3", "name": "Hierarchical Clustering: Agglomerative and Divisive approaches" },
        { "id": "ml-m3-t4", "name": "Dendrogram: Top-down and Bottom-up approaches" },
        { "id": "ml-m3-t5", "name": "Single-Linkage and Multiple-Linkage" },
        { "id": "ml-m3-t6", "name": "Principal Component Analysis (PCA)" },
        { "id": "ml-m3-t7", "name": "Eigenvalues and Eigenvectors" },
        { "id": "ml-m3-t8", "name": "Variance explained" },
        { "id": "ml-m3-t9", "name": "Dimensionality reduction" },
        { "id": "ml-m3-t10", "name": "Textbook 1: Chapter 8 (Sections 8.1–8.4)" },
        { "id": "ml-m3-t11", "name": "Textbook 2: Chapter 3 (Sections 3.1–3.7)" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "ml-m4",
      "title": "Neural Networks, Ensemble Learning and Optimization",
      "hours": "10 Hours",
      "description": "ANNs, backpropagation, bagging/boosting/stacking, overfitting handling and model selection.",
      "topics": [
        { "id": "ml-m4-t1", "name": "Introduction to Neural Networks: Biological inspiration, ANN, Perceptron" },
        { "id": "ml-m4-t2", "name": "Multi-Layer Perceptron (MLP)" },
        { "id": "ml-m4-t3", "name": "Activation Functions (Sigmoid, Tanh, ReLU)" },
        { "id": "ml-m4-t4", "name": "Feedforward Neural Networks" },
        { "id": "ml-m4-t5", "name": "Training using Backpropagation" },
        { "id": "ml-m4-t6", "name": "Ensemble Learning Techniques: Bagging, Pasting" },
        { "id": "ml-m4-t7", "name": "Random Forests" },
        { "id": "ml-m4-t8", "name": "Boosting (Gradient Boosting, AdaBoost)" },
        { "id": "ml-m4-t9", "name": "Stacking" },
        { "id": "ml-m4-t10", "name": "Techniques for handling overfitting and underfitting" },
        { "id": "ml-m4-t11", "name": "Hyperparameter tuning using Grid Search and Random Search" },
        { "id": "ml-m4-t12", "name": "Real-world considerations for model selection, evaluation, and optimization" }
      ],
      "completedTopicIds": [],
      "progress": 0
    }
  ]
}
')
ON CONFLICT ("subjectCode") DO UPDATE SET
    "subjectName" = EXCLUDED."subjectName",
    "modules" = EXCLUDED."modules",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Intelligent Process Automation (BAI506E2) — Modules III & IV as supplied.
INSERT INTO "SyllabusTemplate" ("subjectCode", "subjectName", "modules")
VALUES ('BAI506E2', 'Intelligent Process Automation', '
{
  "modules": [
    {
      "id": "ipa-m3",
      "title": "OCR, NLP and Chatbot Automation",
      "moduleNumber": 3,
      "hours": "—",
      "description": "Understanding OCR, Tesseract/UiPath OCR, NLP, Dialogflow chatbots, UiPath integration and AI-based task routing.",
      "topics": [
        { "id": "ipa-m3-t1", "name": "Understanding OCR (Optical Character Recognition)" },
        { "id": "ipa-m3-t2", "name": "Using Tesseract OCR and UiPath OCR Activities" },
        { "id": "ipa-m3-t3", "name": "Extracting text from scanned PDFs and images" },
        { "id": "ipa-m3-t4", "name": "Introduction to NLP (Natural Language Processing)" },
        { "id": "ipa-m3-t5", "name": "Creating simple chatbots using Google Dialogflow" },
        { "id": "ipa-m3-t6", "name": "Integrating chatbot with UiPath workflows" },
        { "id": "ipa-m3-t7", "name": "Using AI to classify text or route tasks (e.g., email sorting)" }
      ],
      "completedTopicIds": [],
      "progress": 0
    },
    {
      "id": "ipa-m4",
      "title": "Bot Lifecycle, Orchestrator and Capstone",
      "moduleNumber": 4,
      "hours": "—",
      "description": "Event triggers, debugging/testing/publishing bots, Orchestrator and the mini project/capstone task.",
      "topics": [
        { "id": "ipa-m4-t1", "name": "Event Triggers in Bots" },
        { "id": "ipa-m4-t2", "name": "Debugging and Testing Bots" },
        { "id": "ipa-m4-t3", "name": "Publishing and Managing Bots" },
        { "id": "ipa-m4-t4", "name": "Introduction to Orchestrator (Cloud-based Management)" },
        { "id": "ipa-m4-t5", "name": "Mini Project / Capstone Task" }
      ],
      "completedTopicIds": [],
      "progress": 0
    }
  ]
}
')
ON CONFLICT ("subjectCode") DO UPDATE SET
    "subjectName" = EXCLUDED."subjectName",
    "modules" = EXCLUDED."modules",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Seed live 5th-semester classes from the supplied syllabi. Existing edited rows
-- are left untouched so faculty progress is never overwritten by a re-run.
INSERT INTO "CourseSyllabus"
    ("id", "subjectId", "sectionId", "facultyId", "modules", "isPublished", "publishedAt")
SELECT
    md5(random()::text || clock_timestamp()::text || a."id"),
    a."subjectId",
    a."sectionId",
    a."facultyId",
    t."modules" -> 'modules',
    true,
    CURRENT_TIMESTAMP
FROM "FacultySubject" a
JOIN "Subject" s ON s."id" = a."subjectId"
JOIN "Section" sec ON sec."id" = a."sectionId" AND sec."semester" = 5
JOIN "SyllabusTemplate" t ON t."subjectCode" = s."code"
ON CONFLICT ("subjectId", "sectionId") DO NOTHING;

-- Older runs may have stored the template wrapper object instead of the module array.
UPDATE "CourseSyllabus" cs
SET "modules" = t."modules" -> 'modules'
FROM "SyllabusTemplate" t
JOIN "Subject" s ON s."code" = t."subjectCode"
WHERE cs."subjectId" = s."id"
  AND jsonb_typeof(cs."modules") <> 'array';
