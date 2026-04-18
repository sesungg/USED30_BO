package com.used30.backend.api;

import com.used30.backend.domain.product.ProductStatus;
import com.used30.backend.dto.ApiResponse;
import com.used30.backend.dto.PageResponse;
import com.used30.backend.dto.product.ProductDetailResponse;
import com.used30.backend.dto.product.ProductListItem;
import com.used30.backend.service.ProductService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<PageResponse<ProductListItem>> list(
        @RequestParam(required = false) ProductStatus status,
        @RequestParam(required = false) String search,
        Pageable pageable
    ) {
        return ApiResponse.ok(productService.search(status, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDetailResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(productService.get(id));
    }
}