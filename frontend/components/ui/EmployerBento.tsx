import { useAppSelector } from "@/state/hooks";
import { selectOrganization } from "@/state/selectors";
import React from "react";
import { GoHome, GoOrganization, GoPerson } from "react-icons/go";
import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";

export function EmployerBento() {
    const organization = useAppSelector(selectOrganization)
    return (
        <div className="pt-20 b-5">
            <div className="h-[180px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 md:gap-2 max-w-7xl mx-auto">
                <div
                    className="relative p-6 flex flex-row jus rounded-3xl overflow-hidden border border-[#846b8a] bg-[#2a273c]"
                >
                    <div className="w-3/5 flex flex-col justify-between">
                        <p className="text-base font-bold text-neutral-800 dark:text-white-100 relative z-20">
                            Organization Name
                        </p>
                        <p className="text-neutral-600 dark:text-[#f8ad5d] mt-4 text-xl font-bold relative z-20">
                            {organization?.orgName || "Sweet Drinks Ltd."}
                        </p>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="bg-[#d06f6247] p-2 h-fit rounded-md">
                            <GoOrganization style={{ fill: '#d06f62' }} size={30} />
                        </div>
                    </div>
                </div>
                <div
                    className="relative p-6 flex flex-row jus rounded-3xl overflow-hidden border border-[#846b8a] bg-[#2a273c]"
                >
                    <div className="w-full flex flex-col justify-between">
                        <p className="text-base font-bold text-neutral-800 dark:text-white-100 relative z-20">
                            Treasury Balance
                        </p>
                        <div>
                            <p className="text-neutral-600 dark:text-[#f8ad5d] mt-4 text-xl font-bold relative z-20">
                                {(organization?.orgTreasury ?? 0)/1e8} APT
                            </p>
                            <p className="text-neutral-600 dark:text-green-500 text-xs font-light relative z-20 w-full flex flex-row items-center">
                                <IoIosTrendingUp className="mr-1" /> 0.01% less than yesterday
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="bg-[#f8ad5d4d] p-2 h-fit rounded-md">
                            <GoHome style={{ fill: '#f8ad5d' }} size={30} />
                        </div>
                    </div>
                </div>
                <div
                    className="relative p-6 flex flex-row jus rounded-3xl overflow-hidden border border-[#846b8a] bg-[#2a273c]"
                >
                    <div className="w-full flex flex-col justify-between">
                        <p className="text-base font-bold text-neutral-800 dark:text-white-100 relative z-20">
                            No of Employees
                        </p>
                        <div>
                            <p className="text-neutral-600 dark:text-[#f8ad5d] mt-4 text-xl font-bold relative z-20">
                                {organization?.employees?.length || 0} lifeless souls
                            </p>
                            <p className="text-neutral-600 dark:text-red-500 text-xs font-light relative z-20 w-full flex flex-row items-center">
                                <IoIosTrendingDown className="mr-1" /> 0.01% less than yesterday
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end w-full">
                        <div className="bg-[#00c6bf65] p-2 h-fit rounded-md">
                            <GoPerson style={{ fill: '#00c6c0' }} size={30} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const grid = [
    {
        title: "Organization Name",
        description:
            "Berkley Hathshire",
    },
    {
        title: "Treasury Balance",
        description:
            "100 APT",
    },
    {
        title: "No of Employees",
        description:
            "100",
    },
    //   {
    //     title: "Content Calendar",
    //     description:
    //       "Plan and organize your social media content with an intuitive calendar view, ensuring you never miss a post.",
    //   },
    //   {
    //     title: "Audience Targeting",
    //     description:
    //       "Reach the right audience with advanced targeting options, including demographics, interests, and behaviors.",
    //   },
    //   {
    //     title: "Social Listening",
    //     description:
    //       "Monitor social media conversations and trends to stay informed about what your audience is saying and respond in real-time.",
    //   },
    //   {
    //     title: "Customizable Templates",
    //     description:
    //       "Create stunning social media posts with our customizable templates, designed to fit your brand's unique style and voice.",
    //   },
    //   {
    //     title: "Collaboration Tools",
    //     description:
    //       "Work seamlessly with your team using our collaboration tools, allowing you to assign tasks, share drafts, and provide feedback in real-time.",
    //   },
];