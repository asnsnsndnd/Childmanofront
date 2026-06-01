
import { APi } from "./CenteralAPI";

const MessageConfig=APi.injectEndpoints({
endpoints:(builder)=>({
getMessageById:builder.query({
query:({id,myId})=>`/message/getMessageById?id=${id}&myId=${myId}`,
providesTags:[{type:"Message",id:"messageId"}]

}),
getConversionById:builder.query({
query:(id)=>`/message/getConversionById?id=${id}`,
providesTags:[{type:"conversion",id:"coversionId"}]

}),
getUnreadMessage:builder.query({
query:(id)=>`/message/getUnreadMessage?id=${id}`,
providesTags:[{type:"unreadMessage",id:"unread"}]


})




}),

overrideExisting: false,
})

export const {useGetMessageByIdQuery,useGetConversionByIdQuery,useGetUnreadMessageQuery}=MessageConfig;