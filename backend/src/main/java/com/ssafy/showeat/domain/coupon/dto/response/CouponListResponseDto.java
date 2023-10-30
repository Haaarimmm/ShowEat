package com.ssafy.showeat.domain.coupon.dto.response;

import java.time.LocalDate;

import com.ssafy.showeat.domain.coupon.entity.CouponStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CouponListResponseDto {

	private Long couponId;
	private CouponStatus couponStatus;
	private LocalDate expirationDate;
	private String businessName;
	private String businessImgUrl;
	private String fundingMenu;
	private String fundingImgUrl;
	private Long remainingDays;

}