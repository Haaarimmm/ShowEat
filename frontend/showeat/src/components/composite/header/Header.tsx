/* Import */
import { deleteCookie, getCookie } from "cookies-next";
import { IconButton, TextButton } from "@components/common/button";
import Image from "next/image";
import { patchLogout } from "@apis/auth";
import { getNotification, getNotificationExist } from "@apis/notification";
import ProfileBox from "@/components/composite/profileBox";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { userDefaultValue } from "@stores/users";
import { useRouter } from "next/router";
import useUserState from "@hooks/useUserState";

// ----------------------------------------------------------------------------------------------------

export interface Notification {
    fundingId: number;
    notificationId: number;
    notificationMessage: string;
    notificationType: "COUPON_CREATE" | "COUPON_DEADLINE" | "FUNDING_DEADLINE" | "FUNDING_FAIL";
}

/* Style */
const HeaderContainer = styled("div")`
    // Position Attribute
    position: sticky;
    z-index: 10;

    // Layout Attribute
    display: flex;
    align-items: center;
    justify-content: space-between;

    // Box Model Attribute
    width: 100%;
    height: 5em;
    padding: 0 10%;
    box-sizing: border-box;

    // Style Attribute
    border-bottom: 1px solid ${(props) => props.theme.colors.gray2};
    background-color: white;

    // Interaction Attribute
    user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
`;

const LogoImageWrapper = styled("div")`
    // Interaction Attribute
    cursor: pointer;
`;

const LogoImage = styled(Image)`
    // Box Model Attribute
    object-fit: cover;
`;

const NavigationContainer = styled("div")<{ isAuth: boolean }>`
    // Layout Attribute
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${(props) => (props.isAuth ? "1em" : "3em")};
`;

const ProfileBoxWrapper = styled("div")`
    // Interaction Attribute
    cursor: pointer;
`;

const ButtonWrapper = styled("div")`
    // Text Attribute
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
    &:hover {
        font-weight: 700;
        color: ${(props) => props.theme.colors.primary3};
    }

    // Interaction Attribute
    cursor: pointer;
`;

const NotificationContainer = styled("div")`
    width: 250px;
    height: 250px;
    border-radius: 20px;
    border: 1px solid #000;
    background: #fff;
    display: flex;
    position: relative;
    top: 150px;
    left: 270px;
`;

const NotificationListBox = styled("div")`
    width: 220px;
    height: 220px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-right: 1px solid rgba(0, 0, 0, 0.33);
    border-left: 1px solid rgba(0, 0, 0, 0.33);
    overflow-y: auto;
    flex-shrink: 0;
    overflow-x: hidden;
`;

const NotificationBox = styled("div")`
    display: flex;
    width: 424px;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    margin: 5px 10px;
`;

const NotificationTitleWrapper = styled("div")`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
`;

const NotificationMessageWrapper = styled("div")`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 400;
    line-height: 20px;
`;

const NotificationWrapper = styled("div")`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
    height: 100%;
    align-items: center;
    margin-left: 50px;
`;

// ----------------------------------------------------------------------------------------------------

/* Header Component */
function Header() {
    // States and Variables
    const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT;
    const router = useRouter();
    const [user, setUser] = useUserState();
    const [hasAccessToken, setHasAccessToken] = useState<boolean>(false);
    const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(false);
    const [isNotificationExist, setIsNotificationExist] = useState<boolean>(false);
    const [participatingFunding, setParticipatingFunding] = useState<Notification[]>([]);
    const [bookmarkFunding, setBookmarkFunding] = useState<Notification[]>([]);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    // Function for Handling Logout
    const handleNotification = () => {
        getNotification().then((res) => {
            setParticipatingFunding(res.data.participatingFunding);
            setBookmarkFunding(res.data.bookmarkFunding);
            setIsNotificationExist(false);
        });
    };

    // Function for Handling Logout
    const handleLogout = () => {
        const accessToken = getCookie("access-token");
        patchLogout(user.userId, accessToken).then(() => {
            deleteCookie("access-token");
            deleteCookie("refresh-token");
            setHasAccessToken(false);
            setUser(userDefaultValue);
            router.replace("/");
        });
    };

    // Function for Rendering Buttons
    const renderButton = () => {
        if (!user.userBusiness) {
            return (
                <TextButton
                    width="150px"
                    onClick={() => router.push("/service")}
                    text="셀러 등록"
                    curve="round"
                />
            );
        }
        if (!router.asPath.startsWith("/sellers")) {
            return (
                <TextButton
                    width="150px"
                    onClick={() => router.push("/sellers/profile/basic-info")}
                    text="셀러 전환"
                    curve="round"
                />
            );
        }
        return (
            <TextButton
                width="150px"
                onClick={() => router.push("/")}
                text="바이어 전환"
                curve="round"
            />
        );
    };

    useEffect(() => {
        setHasAccessToken(Boolean(getCookie("access-token")) && user.userId !== 0);
    }, [user]);

    // Function for Checking Notification Existence
    const checkNotificationExistence = async () => {
        try {
            const response = await getNotificationExist();
            const notificationExists = response.data;

            setIsNotificationExist(notificationExists);
            console.log("checkNotificationExistence 실행", notificationExists);
        } catch (error) {
            console.error("Error checking notification existence:", error);
        }
    };

    useEffect(() => {
        if (user.userId !== 0) {
            checkNotificationExistence();
            try {
                setEventSource(new EventSource(`${ENDPOINT}notification/subscribe/${user.userId}`));

                eventSource?.addEventListener("open", (event) => {
                    console.log(event);
                    console.log("connection opened");
                });

                eventSource?.addEventListener("alarm", (event) => {
                    console.log("alarm");
                    console.log(event.data);

                    checkNotificationExistence();
                });

                eventSource?.addEventListener("error", (event) => {
                    console.log("error");
                    console.log(event);
                    const es = event.target as EventSource;
                    console.log(es?.readyState);
                    if (es?.readyState === EventSource.CLOSED) {
                        console.log(`eventsource closed (${es?.readyState})`);
                    }
                    es?.close();
                });
            } catch (error) {
                console.error("Error setting up EventSource:", error);
            }
        }
    }, [user.userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const notificationContainer = document.getElementById("notification-container");

            if (
                notificationContainer &&
                !notificationContainer.contains(event.target as Node) &&
                isNotificationVisible
            ) {
                setIsNotificationVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNotificationVisible, eventSource]);

    return (
        <HeaderContainer>
            <LogoImageWrapper onClick={() => router.push("/")}>
                <LogoImage
                    src="/assets/images/service-logo.png"
                    width={120}
                    height={60}
                    alt="service-logo"
                    priority
                />
            </LogoImageWrapper>
            <NavigationContainer isAuth={hasAccessToken}>
                {hasAccessToken ? (
                    <>
                        {isNotificationVisible && (
                            <NotificationContainer id="notification-container">
                                <NotificationListBox>
                                    {participatingFunding.length === 0 &&
                                    bookmarkFunding.length === 0 ? (
                                        <NotificationWrapper>
                                            읽지 않은 알림이 없습니다
                                        </NotificationWrapper>
                                    ) : (
                                        <>
                                            {participatingFunding.length > 0 && (
                                                <NotificationBox>
                                                    <NotificationTitleWrapper>
                                                        참여한 펀딩
                                                    </NotificationTitleWrapper>
                                                    {participatingFunding.map(
                                                        (notification, index) => (
                                                            <NotificationMessageWrapper key={index}>
                                                                {notification.notificationMessage}
                                                            </NotificationMessageWrapper>
                                                        ),
                                                    )}
                                                </NotificationBox>
                                            )}
                                            {bookmarkFunding.length > 0 && (
                                                <NotificationBox>
                                                    <NotificationTitleWrapper>
                                                        좋아요한 펀딩
                                                    </NotificationTitleWrapper>
                                                    {bookmarkFunding.map((notification, index) => (
                                                        <NotificationMessageWrapper key={index}>
                                                            {notification.notificationMessage}
                                                        </NotificationMessageWrapper>
                                                    ))}
                                                </NotificationBox>
                                            )}
                                        </>
                                    )}
                                </NotificationListBox>
                            </NotificationContainer>
                        )}
                        <IconButton
                            width="30"
                            onClick={() => {
                                handleNotification();
                                setIsNotificationVisible(!isNotificationVisible);
                            }}
                            source={
                                isNotificationExist
                                    ? "/assets/icons/alarm-not-read-icon.svg"
                                    : "/assets/icons/alarm-read-icon.svg"
                            }
                            alternative="alarm-read-icon"
                        />
                        <IconButton
                            width="30"
                            onClick={handleLogout}
                            source="/assets/icons/logout-icon.svg"
                            alternative="logout-icon"
                        />
                        <ProfileBoxWrapper onClick={() => router.push("/buyers/profile")}>
                            <ProfileBox source={user.userImgUrl} nickname={user.userNickname} />
                        </ProfileBoxWrapper>
                        {renderButton()}
                    </>
                ) : (
                    <>
                        <ButtonWrapper onClick={() => router.push("/sign-in")}>
                            로그인
                        </ButtonWrapper>
                        <ButtonWrapper onClick={() => router.push("/sign-in")}>
                            회원가입
                        </ButtonWrapper>
                    </>
                )}
            </NavigationContainer>
        </HeaderContainer>
    );
}

// ----------------------------------------------------------------------------------------------------

/* Export */
export default Header;
