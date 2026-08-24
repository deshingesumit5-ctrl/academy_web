package com.AcademyWeb.config;

import com.AcademyWeb.entity.Caste;
import com.AcademyWeb.entity.District;
import com.AcademyWeb.entity.KitSize;
import com.AcademyWeb.entity.Religion;
import com.AcademyWeb.repository.CasteRepository;
import com.AcademyWeb.repository.DistrictRepository;
import com.AcademyWeb.repository.KitSizeRepository;
import com.AcademyWeb.repository.ReligionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

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
        if (religionRepository.count() == 0) {
            List<String> defaultReligions = Arrays.asList(
                "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Other"
            );
            for (String rName : defaultReligions) {
                religionRepository.save(Religion.builder().name(rName).status("Active").build());
            }
        }

        if (casteRepository.count() == 0) {
            List<String> defaultCastes = Arrays.asList(
                "General", "OBC", "SC", "ST", "NT", "VJNT", "SBC", "Open"
            );
            for (String cName : defaultCastes) {
                casteRepository.save(Caste.builder().name(cName).status("Active").build());
            }
        }

        if (kitSizeRepository.count() == 0) {
            List<String> defaultKitSizes = Arrays.asList(
                "Small (S)", "Medium (M)", "Large (L)", "X-Large (XL)", "XX-Large (XXL)"
            );
            for (String kName : defaultKitSizes) {
                kitSizeRepository.save(KitSize.builder().name(kName).status("Active").build());
            }
        }

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
