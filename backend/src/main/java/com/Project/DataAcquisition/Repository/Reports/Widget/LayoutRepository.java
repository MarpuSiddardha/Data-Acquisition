package com.Project.DataAcquisition.Repository.Reports.Widget;

import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LayoutRepository extends JpaRepository<Layout, Long>, JpaSpecificationExecutor<Layout> {
    Optional<Layout> findByLayoutName(String layoutName);

    @Query("SELECT l FROM Layout l WHERE LOWER(l.layoutName) LIKE LOWER(CONCAT('%', :layoutName, '%'))")
    List<Layout> findByLayoutNameContainingIgnoreCase(@Param("layoutName") String layoutName);


//    @Query("SELECT l FROM Layout l WHERE LOWER(l.layoutName) LIKE LOWER(CONCAT('%', :layoutName, '%'))")
//    List<Layout> findByLayoutNameContainingIgnoreCase(@Param("layoutName") String layoutName);

    @Query("SELECT l FROM Layout l " +
            "WHERE (:layoutType IS NULL OR l.layoutType = :layoutType) " +
            "AND (:layoutName IS NULL OR l.layoutName LIKE %:layoutName%) " +
            "AND (:startDate IS NULL OR l.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR l.createdAt <= :endDate)")
    List<Layout> findFilteredLayouts(@Param("layoutType") String layoutType,
                                     @Param("layoutName") String layoutName,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT l.layoutType FROM Layout l")
    List<String> findDistinctLayoutTypes();
}
