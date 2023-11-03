/* Import */
import { deleteCookie, getCookie } from "cookies-next";
import { IconButton, TextButton } from "@components/common/button";
import Image from "next/image";
import styled from "@emotion/styled";
import ProfileBox from "@components/profileBox";
import { userDefaultValue } from "@stores/users";
import { useRouter } from "next/router";
import useUserState from "@hooks/useUserState";

// ----------------------------------------------------------------------------------------------------

/* Style */
const HeaderContainer = styled("div")`
    // Position Attribute
    position: sticky;

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

// ----------------------------------------------------------------------------------------------------

/* Header Component */
function Header() {
    // States and Variables
    const router = useRouter();
    const [user, setUser] = useUserState();
    const hasAccessToken = Boolean(getCookie("access-token"));

    // Function for Handling Logout
    const handleLogout = () => {
        deleteCookie("access-token");
        setUser(userDefaultValue);
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

    return (
        <HeaderContainer>
            <LogoImageWrapper onClick={() => router.push("/")}>
                <LogoImage
                    src="/assets/images/service-logo.png"
                    width={120}
                    height={60}
                    alt="logo-icon"
                    priority
                />
            </LogoImageWrapper>
            <NavigationContainer isAuth={!hasAccessToken}>
                {!hasAccessToken ? (
                    <>
                        <IconButton
                            width="30"
                            onClick={() => {}}
                            source="/assets/icons/alarm-read-icon.svg"
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