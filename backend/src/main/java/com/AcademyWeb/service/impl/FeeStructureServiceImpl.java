package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.*;
import com.AcademyWeb.entity.*;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.*;
import com.AcademyWeb.service.FeeStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FeeStructureServiceImpl implements FeeStructureService {

    @Autowired
    private AcademyFeePlanRepository academyFeePlanRepository;

    @Autowired
    private LibraryFeePlanRepository libraryFeePlanRepository;

    @Autowired
    private InstallmentPlanRepository installmentPlanRepository;

    @Autowired
    private DiscountRuleRepository discountRuleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LibraryPlanRepository libraryPlanRepository;

    @Override
    public FeeStructureDto getFeeStructure() {
        List<AcademyFeePlanDto> academyPlans = academyFeePlanRepository.findAll().stream().map(plan ->
                AcademyFeePlanDto.builder()
                        .academyFeePlanId(plan.getAcademyFeePlanId())
                        .courseId(plan.getCourse() != null ? plan.getCourse().getCourseId() : null)
                        .courseName(plan.getCourse() != null ? plan.getCourse().getCourseName() : null)
                        .planName(plan.getPlanName())
                        .totalFee(plan.getTotalFee())
                        .duration(plan.getDuration())
                        .description(plan.getDescription())
                        .isActive(plan.getIsActive())
                        .build()
        ).collect(Collectors.toList());

        List<LibraryFeePlanDto> libraryPlans = libraryFeePlanRepository.findAll().stream().map(plan ->
                LibraryFeePlanDto.builder()
                        .libraryFeePlanId(plan.getLibraryFeePlanId())
                        .planId(plan.getLibraryPlan() != null ? plan.getLibraryPlan().getPlanId() : null)
                        .libraryPlanName(plan.getLibraryPlan() != null ? plan.getLibraryPlan().getPlanName() : null)
                        .planName(plan.getPlanName())
                        .totalFee(plan.getTotalFee())
                        .duration(plan.getDuration())
                        .description(plan.getDescription())
                        .isActive(plan.getIsActive())
                        .build()
        ).collect(Collectors.toList());

        List<InstallmentPlanDto> installmentPlans = installmentPlanRepository.findAll().stream().map(plan ->
                InstallmentPlanDto.builder()
                        .installmentPlanId(plan.getInstallmentPlanId())
                        .feeType(plan.getFeeType())
                        .academyFeePlanId(plan.getAcademyFeePlan() != null ? plan.getAcademyFeePlan().getAcademyFeePlanId() : null)
                        .libraryFeePlanId(plan.getLibraryFeePlan() != null ? plan.getLibraryFeePlan().getLibraryFeePlanId() : null)
                        .numInstallments(plan.getNumInstallments())
                        .installmentAmount(plan.getInstallmentAmount())
                        .installmentNumber(plan.getInstallmentNumber())
                        .dueDate(plan.getDueDate())
                        .build()
        ).collect(Collectors.toList());

        List<DiscountRuleDto> discountRules = discountRuleRepository.findAll().stream().map(rule ->
                DiscountRuleDto.builder()
                        .discountRuleId(rule.getDiscountRuleId())
                        .ruleName(rule.getRuleName())
                        .feeType(rule.getFeeType())
                        .academyFeePlanId(rule.getAcademyFeePlan() != null ? rule.getAcademyFeePlan().getAcademyFeePlanId() : null)
                        .libraryFeePlanId(rule.getLibraryFeePlan() != null ? rule.getLibraryFeePlan().getLibraryFeePlanId() : null)
                        .discountType(rule.getDiscountType())
                        .discountValue(rule.getDiscountValue())
                        .validFrom(rule.getValidFrom())
                        .validTo(rule.getValidTo())
                        .isActive(rule.getIsActive())
                        .build()
        ).collect(Collectors.toList());

        return FeeStructureDto.builder()
                .academyFeePlans(academyPlans)
                .libraryFeePlans(libraryPlans)
                .installmentPlans(installmentPlans)
                .discountRules(discountRules)
                .build();
    }

    @Override
    @Transactional
    public AcademyFeePlanDto createAcademyFeePlan(AcademyFeePlanDto dto) {
        Course course = null;
        if (dto.getCourseId() != null) {
            course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        }
        AcademyFeePlan plan = AcademyFeePlan.builder()
                .course(course)
                .planName(dto.getPlanName())
                .totalFee(dto.getTotalFee())
                .duration(dto.getDuration())
                .description(dto.getDescription())
                .isActive(true)
                .build();
        AcademyFeePlan saved = academyFeePlanRepository.save(plan);
        dto.setAcademyFeePlanId(saved.getAcademyFeePlanId());
        return dto;
    }

    @Override
    @Transactional
    public AcademyFeePlanDto updateAcademyFeePlan(Long id, AcademyFeePlanDto dto) {
        AcademyFeePlan plan = academyFeePlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee plan not found"));
        plan.setPlanName(dto.getPlanName());
        if (dto.getTotalFee() != null) {
            plan.setTotalFee(dto.getTotalFee());
        }
        if (dto.getDuration() != null) {
            plan.setDuration(dto.getDuration());
        }
        if (dto.getDescription() != null) {
            plan.setDescription(dto.getDescription());
        }
        AcademyFeePlan saved = academyFeePlanRepository.save(plan);
        dto.setAcademyFeePlanId(saved.getAcademyFeePlanId());
        return dto;
    }

    @Override
    @Transactional
    public LibraryFeePlanDto createLibraryFeePlan(LibraryFeePlanDto dto) {
        LibraryPlan libraryPlan = null;
        if (dto.getPlanId() != null) {
            libraryPlan = libraryPlanRepository.findById(dto.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Library plan not found"));
        }
        LibraryFeePlan plan = LibraryFeePlan.builder()
                .libraryPlan(libraryPlan)
                .planName(dto.getPlanName())
                .totalFee(dto.getTotalFee())
                .duration(dto.getDuration())
                .description(dto.getDescription())
                .isActive(true)
                .build();
        LibraryFeePlan saved = libraryFeePlanRepository.save(plan);
        dto.setLibraryFeePlanId(saved.getLibraryFeePlanId());
        return dto;
    }

    @Override
    @Transactional
    public InstallmentPlanDto createInstallmentPlan(InstallmentPlanDto dto) {
        AcademyFeePlan academyFeePlan = null;
        if (dto.getAcademyFeePlanId() != null) {
            academyFeePlan = academyFeePlanRepository.findById(dto.getAcademyFeePlanId()).orElse(null);
        }
        LibraryFeePlan libraryFeePlan = null;
        if (dto.getLibraryFeePlanId() != null) {
            libraryFeePlan = libraryFeePlanRepository.findById(dto.getLibraryFeePlanId()).orElse(null);
        }
        InstallmentPlan plan = InstallmentPlan.builder()
                .feeType(dto.getFeeType())
                .academyFeePlan(academyFeePlan)
                .libraryFeePlan(libraryFeePlan)
                .numInstallments(dto.getNumInstallments())
                .installmentAmount(dto.getInstallmentAmount())
                .installmentNumber(dto.getInstallmentNumber())
                .dueDate(dto.getDueDate())
                .build();
        InstallmentPlan saved = installmentPlanRepository.save(plan);
        dto.setInstallmentPlanId(saved.getInstallmentPlanId());
        return dto;
    }

    @Override
    @Transactional
    public DiscountRuleDto createDiscountRule(DiscountRuleDto dto) {
        AcademyFeePlan academyFeePlan = null;
        if (dto.getAcademyFeePlanId() != null) {
            academyFeePlan = academyFeePlanRepository.findById(dto.getAcademyFeePlanId()).orElse(null);
        }
        LibraryFeePlan libraryFeePlan = null;
        if (dto.getLibraryFeePlanId() != null) {
            libraryFeePlan = libraryFeePlanRepository.findById(dto.getLibraryFeePlanId()).orElse(null);
        }
        DiscountRule rule = DiscountRule.builder()
                .ruleName(dto.getRuleName())
                .feeType(dto.getFeeType())
                .academyFeePlan(academyFeePlan)
                .libraryFeePlan(libraryFeePlan)
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .isActive(true)
                .build();
        DiscountRule saved = discountRuleRepository.save(rule);
        dto.setDiscountRuleId(saved.getDiscountRuleId());
        return dto;
    }

    @Override
    @Transactional
    public void deleteAcademyFeePlan(Long id) {
        academyFeePlanRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteLibraryFeePlan(Long id) {
        libraryFeePlanRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteInstallmentPlan(Long id) {
        installmentPlanRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteDiscountRule(Long id) {
        discountRuleRepository.deleteById(id);
    }
}
