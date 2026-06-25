USE ethiopia_file_index;

-- Seed Departments
INSERT INTO departments (name_am, name_or, name_en, slug, color, icon) VALUES
('የሰላም እሴት ግንባታ', 'Ijaarsa Gatii Nagaa', 'Peace Values Building', 'peace-values', '#1B6CA8', 'peace'),
('የሰው ሃብት', 'Qabeenya Namaa', 'Human Resources', 'human-resources', '#1E8449', 'people'),
('የፋይናንስ', 'Maallaqaa', 'Finance', 'finance', '#B7950B', 'finance'),
('የፕላንና በጀት', 'Karoora fi Baajata', 'Plan and Budget', 'plan-budget', '#6C3483', 'plan'),
('የህዝብ ግንኙነት', 'Dhimma Hawaasaa', 'Public Relations', 'public-relations', '#1A5276', 'public'),
('የሴቶችና ህፃናት', 'Dubartii fi Daa\'imman', 'Women and Children', 'women-children', '#C0392B', 'family'),
('የወጣቶች', 'Dargaggoota', 'Youth', 'youth', '#117A65', 'youth');

-- Seed Default Admin User (password: Admin@1234)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@gov.et', '$2a$10$exqUfIoSCKTUlC0Q8Lrt.eV512lKArkvB.e2ZP7DKwhmx7i7MTvCe', 'System Administrator', 'superadmin');

-- Seed Sample Files
INSERT INTO files (file_number, title_am, title_or, title_en, department_id, description) VALUES
('001/2016', 'የስልጠና ፋይል', 'Faayilii Leenjii', 'Training File', 1, 'ዋና የስልጠና ሰነዶች ፋይል'),
('002/2016', 'የስልጠና ሰነድ', 'Galmee Leenjii', 'Training Document', 1, 'ሁሉንም የስልጠና ሰነዶች የያዘ'),
('003/2016', 'ግንዛቤ ስልጠና', 'Leenjii Hubannoo', 'Awareness Training', 1, 'የህዝብ ግንዛቤ ማስጨበጫ ሰነዶች'),
('004/2016', 'ንቅናቄና ኮንፈረንስ', 'Sochiifi Konfaransii', 'Campaigns and Conferences', 2, 'ሁሉም ዝግጅቶችና ኮንፈረንሶች'),
('005/2016', 'ብሄራዊ በጎ ፍቃድ', 'Fedhii Tola Ooltummaa Biyyaalessaa', 'National Volunteerism', 3, 'ብሄራዊ የበጎ ፍቃደኝነት ፕሮግራሞች'),
('006/2016', 'የሰው ሃብት አስተዳደር ፋይል', 'Faayilii Bulchiinsa Qabeenya Namaa', 'HR Management File', 2, 'የሰው ሃብት አስተዳደር ዋና ሰነዶች'),
('007/2016', 'የበጀት ዕቅድ ሰነድ', 'Galmee Karoora Baajataa', 'Budget Plan Document', 4, 'ዓመታዊ የበጀት ዕቅድ'),
('008/2016', 'የሴቶች ሕጋዊ መብቶች', 'Mirgoota Seeraa Dubartoota', 'Women Legal Rights', 6, 'የሴቶች ሕጋዊ መብቶች ሰነዶች'),
('009/2016', 'የወጣቶች ልማት ፕሮግራም', 'Sagantaa Misooma Dargaggootaa', 'Youth Development Program', 7, 'የወጣቶች ልማት ዕቅዶች'),
('010/2016', 'ህዝብ ግንኙነት ሪፖርት', 'Gabaasa Dhimma Hawaasaa', 'Public Relations Report', 5, 'ዓመታዊ የህዝብ ግንኙነት ሪፖርት'),
('011/2016', 'የፋይናንስ ሪፖርት', 'Gabaasa Maallaqaa', 'Finance Report', 3, 'ሩብ ዓመት የፋይናንስ ሪፖርት'),
('012/2016', 'ዓመታዊ ዕቅድ', 'Karoora Waggaa', 'Annual Plan', 4, 'ዓመታዊ ዕቅድና አፈፃፀም'),
('013/2016', 'የሕፃናት ፕሮግራም', 'Sagantaa Daa\'immanii', 'Children Program', 6, 'የሕፃናት ድጋፍ ፕሮግራሞች'),
('014/2016', 'ሰላማዊ ማህበረሰብ ፋይል', 'Faayilii Hawaasa Nagaa', 'Peaceful Community File', 1, 'ሰላማዊ ማህበረሰብ ግንባታ ሰነዶች'),
('015/2016', 'የስምምነት ሰነዶች', 'Galmeelee Waliigaltee', 'Agreement Documents', 5, 'ዋና ዋና ስምምነቶች');
