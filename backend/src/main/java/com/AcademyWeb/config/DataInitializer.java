package com.AcademyWeb.config;

import com.AcademyWeb.entity.Caste;
import com.AcademyWeb.entity.CategoryMaster;
import com.AcademyWeb.entity.District;
import com.AcademyWeb.entity.KitSize;
import com.AcademyWeb.entity.Religion;
import com.AcademyWeb.repository.CasteRepository;
import com.AcademyWeb.repository.CategoryRepository;
import com.AcademyWeb.repository.DistrictRepository;
import com.AcademyWeb.repository.KitSizeRepository;
import com.AcademyWeb.repository.ReligionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CasteRepository casteRepository;

    @Autowired
    private KitSizeRepository kitSizeRepository;

    @Autowired
    private ReligionRepository religionRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Categories
        Map<String, CategoryMaster> categoryMap = new HashMap<>();
        if (categoryRepository.count() == 0) {
            List<String[]> defaultCategories = Arrays.asList(
                new String[]{"OPEN", "OPEN", "खुला प्रवर्ग"},
                new String[]{"SC", "SC", "अनुसूचित जाती"},
                new String[]{"ST", "ST", "अनुसूचित जमाती"},
                new String[]{"VJ-A", "VJ-A", "विमुक्त जाती (अ)"},
                new String[]{"NT-B", "NT-B", "भटक्या जमाती (ब)"},
                new String[]{"NT-C", "NT-C", "भटक्या जमाती (क)"},
                new String[]{"NT-D", "NT-D", "भटक्या जमाती (ड)"},
                new String[]{"SBC", "SBC", "विशेष मागास प्रवर्ग"},
                new String[]{"OBC", "OBC", "इतर मागास वर्ग"},
                new String[]{"SEBC", "SEBC", "सामाजिक व शैक्षणिक मागास प्रवर्ग"},
                new String[]{"EWS", "EWS", "आर्थिकदृष्ट्या दुर्बल घटक"}
            );

            for (String[] cat : defaultCategories) {
                CategoryMaster cm = categoryRepository.save(
                    CategoryMaster.builder()
                        .categoryCode(cat[0])
                        .categoryName(cat[1])
                        .categoryNameMarathi(cat[2])
                        .status("Active")
                        .build()
                );
                categoryMap.put(cat[0], cm);
            }
        } else {
            for (CategoryMaster cm : categoryRepository.findAll()) {
                categoryMap.put(cm.getCategoryCode(), cm);
            }
        }

        // 2. Seed Standard Maharashtra Castes
        // If table is empty or only has the old 8 generic names
        boolean needsCasteSeed = casteRepository.count() == 0;
        if (!needsCasteSeed && casteRepository.count() <= 8) {
            List<Caste> existing = casteRepository.findAll();
            boolean onlyLegacy = existing.stream().allMatch(c ->
                Arrays.asList("GENERAL", "OBC", "SC", "ST", "NT", "VJNT", "SBC", "OPEN")
                    .contains(c.getCasteName() != null ? c.getCasteName().trim().toUpperCase() : "")
            );
            if (onlyLegacy) {
                casteRepository.deleteAll();
                needsCasteSeed = true;
            }
        }

        if (needsCasteSeed) {
            // [Caste Name (English), Marathi Name, Default Category Code]
            String[][] casteData = {
                // SEBC
                {"Maratha", "मराठा", "SEBC"},
                {"Kunbi-Maratha", "कुणबी-मराठा", "SEBC"},

                // OBC
                {"Kunbi", "कुणबी", "OBC"},
                {"Mali", "माळी", "OBC"},
                {"Teli", "तेली", "OBC"},
                {"Agri", "आग्री", "OBC"},
                {"Bhandari", "भंडारी", "OBC"},
                {"Shimpi", "शिंपी", "OBC"},
                {"Kumbhar", "कुंभार", "OBC"},
                {"Nhavi", "न्हावी", "OBC"},
                {"Sutar", "सुतार", "OBC"},
                {"Gurav", "गुरव", "OBC"},
                {"Dhobi", "धोबी", "OBC"},
                {"Leva Patil", "लेवा पाटील", "OBC"},
                {"Sonar", "सोनार", "OBC"},
                {"Kasar", "कासार", "OBC"},
                {"Tambat", "तांबट", "OBC"},
                {"Gavali", "गवळी", "OBC"},
                {"Sali", "साळी", "OBC"},

                // SC
                {"Mahar", "महार", "SC"},
                {"Neo-Buddhist", "नवबौद्ध", "SC"},
                {"Matang", "मातंग", "SC"},
                {"Mang", "मांग", "SC"},
                {"Chambhar", "चांभार", "SC"},
                {"Bhangi", "भंगी", "SC"},
                {"Dhor", "ढोर", "SC"},
                {"Khatik", "खटीक", "SC"},
                {"Holar", "होलार", "SC"},
                {"Meghwal", "मेघवाल", "SC"},

                // ST
                {"Bhil", "भिल्ल", "ST"},
                {"Gond", "गोंड", "ST"},
                {"Koli Mahadev", "कोळी महादेव", "ST"},
                {"Warli", "वारली", "ST"},
                {"Katkari", "कातकरी", "ST"},
                {"Halba", "हलबा", "ST"},
                {"Korku", "कोरकू", "ST"},
                {"Kokna", "कोकणा", "ST"},
                {"Andh", "आंध", "ST"},
                {"Thakur", "ठाकूर", "ST"},

                // VJ-A
                {"Banjara", "बंजारा", "VJ-A"},
                {"Gor Banjara", "गोर बंजारा", "VJ-A"},
                {"Pardhi", "पारधी", "VJ-A"},
                {"Ramoshi", "रामोशी", "VJ-A"},
                {"Kaikadi", "कैकाडी", "VJ-A"},
                {"Berad", "बेरड", "VJ-A"},
                {"Chhapparband", "छप्परबंद", "VJ-A"},

                // NT-B
                {"Beldar", "बेलदार", "NT-B"},
                {"Gosavi", "गोसावी", "NT-B"},
                {"Bava", "बावा", "NT-B"},
                {"Lohar", "लोहार", "NT-B"},
                {"Bharadi", "भराडी", "NT-B"},
                {"Nathpanthi", "नाथपंथी", "NT-B"},
                {"Kolhati", "कोल्हाटी", "NT-B"},
                {"Vaidu", "वैदू", "NT-B"},
                {"Joshi", "जोशी", "NT-B"},

                // NT-C
                {"Dhangar", "धनगर", "NT-C"},
                {"Khutekar", "खुटेकर", "NT-C"},
                {"Hatkar", "हटकर", "NT-C"},
                {"Shegar", "शेगर", "NT-C"},

                // NT-D
                {"Vanjari", "वंजारी", "NT-D"},

                // SBC
                {"Koli", "कोळी", "SBC"},
                {"Koshti", "कोष्टी", "SBC"},
                {"Govandi", "गोवंडी", "SBC"},
                {"Padmashali", "पद्मशाली", "SBC"},

                // OPEN
                {"Brahmin", "ब्राह्मण", "OPEN"},
                {"Deshastha", "देशस्थ", "OPEN"},
                {"Kokanastha", "कोकणस्थ", "OPEN"},
                {"Karhade", "कऱ्हाडे", "OPEN"},
                {"Saraswat", "सारस्वत", "OPEN"},
                {"Marwari", "मारवाडी", "OPEN"},
                {"Jain", "जैन", "OPEN"},
                {"Rajput", "राजपूत", "OPEN"},
                {"Kshatriya", "क्षत्रिय", "OPEN"},
                {"CKP", "सी.के.पी.", "OPEN"},
                {"Lingayat", "लिंगायत", "OPEN"},
                {"Sindhi", "सिंधी", "OPEN"},
                {"Parsi", "पारसी", "OPEN"}
            };

            for (String[] entry : casteData) {
                String cName = entry[0];
                String marathi = entry[1];
                String catCode = entry[2];
                CategoryMaster cm = categoryMap.get(catCode);
                Long catId = cm != null ? cm.getId() : null;

                casteRepository.save(
                    Caste.builder()
                        .casteName(cName)
                        .casteNameMarathi(marathi)
                        .categoryId(catId)
                        .categoryCode(catCode)
                        .status("Active")
                        .build()
                );
            }
        }

        // 3. Seed Religions
        if (religionRepository.count() == 0) {
            List<String> defaultReligions = Arrays.asList(
                "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Other"
            );
            for (String rName : defaultReligions) {
                religionRepository.save(Religion.builder().name(rName).status("Active").build());
            }
        }

        // 4. Seed Kit Sizes
        if (kitSizeRepository.count() == 0) {
            List<String> defaultKitSizes = Arrays.asList(
                "Small (S)", "Medium (M)", "Large (L)", "X-Large (XL)", "XX-Large (XXL)"
            );
            for (String kName : defaultKitSizes) {
                kitSizeRepository.save(KitSize.builder().name(kName).status("Active").build());
            }
        }

        // 5. Seed Districts
        if (districtRepository.count() == 0) {
            List<String> defaultDistricts = Arrays.asList(
                "Ahilyanagar (Ahmednagar)", "Akola", "Amravati", "Chhatrapati Sambhajinagar (Aurangabad)", 
                "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", 
                "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", 
                "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", 
                "Nashik", "Dharashiv (Osmanabad)", "Palghar", "Parbhani", "Pune", 
                "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", 
                "Thane", "Wardha", "Washim", "Yavatmal"
            );
            for (String dName : defaultDistricts) {
                districtRepository.save(District.builder().name(dName).status("Active").build());
            }
        }
    }
}
