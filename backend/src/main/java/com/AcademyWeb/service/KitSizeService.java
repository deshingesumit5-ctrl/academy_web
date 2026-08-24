package com.AcademyWeb.service;

import com.AcademyWeb.entity.KitSize;
import java.util.List;

public interface KitSizeService {
    List<KitSize> getAllKitSizes();
    List<KitSize> getActiveKitSizes();
    KitSize getKitSizeById(Long id);
    KitSize saveKitSize(KitSize kitSize);
    void deleteKitSize(Long id);
}
