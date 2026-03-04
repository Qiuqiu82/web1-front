package com.easymusic.controller;

import com.alibaba.fastjson2.JSONObject;
import com.alibaba.fastjson2.JSONPath;
import com.easymusic.annotation.GlobalInterceptor;
import com.easymusic.entity.constants.Constants;
import com.easymusic.entity.dto.TokenUserInfoDTO;
import com.easymusic.entity.enums.CommendTypeEnum;
import com.easymusic.entity.enums.MusicStatusEnum;
import com.easymusic.entity.enums.PageSize;
import com.easymusic.entity.po.MusicCreation;
import com.easymusic.entity.po.MusicInfo;
import com.easymusic.entity.po.MusicInfoAction;
import com.easymusic.entity.query.MusicInfoQuery;
import com.easymusic.entity.vo.ResponseVO;
import com.easymusic.service.MusicCreationService;
import com.easymusic.service.MusicInfoActionService;
import com.easymusic.service.MusicInfoService;
import com.easymusic.utils.FileUtils;
import com.easymusic.utils.JsonUtils;
import com.easymusic.utils.OKHttpUtils;
import com.easymusic.utils.StringTools;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/music")
public class MusicController extends ABaseController {

    @Resource
    private MusicInfoService musicInfoService;

    @Resource
    private MusicCreationService musicCreationService;

    @Resource
    private MusicInfoActionService musicInfoActionService;

    @RequestMapping("/loadCommendMusic")
    public ResponseVO loadCommendMusic() {

        TokenUserInfoDTO tokenUserInfoDTO = getTokenUserInfo(null);
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setQueryUser(true);
        musicInfoQuery.setCommendType(CommendTypeEnum.COMMEND.getType());
        musicInfoQuery.setCurrentUserId(tokenUserInfoDTO == null ? null : tokenUserInfoDTO.getUserId());
        musicInfoQuery.setOrderBy("m.create_time desc");
        return getSuccessResponseVO(musicInfoService.findListByParam(musicInfoQuery));
    }

    @RequestMapping("/loadLatestMusic")
    public ResponseVO loadLatestMusic(Integer pageNo, Integer indexType) {
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setQueryUser(true);
        musicInfoQuery.setCommendType(CommendTypeEnum.NOT_COMMEND.getType());
        musicInfoQuery.setMusicStatus(MusicStatusEnum.CREATED.getStatus());
        musicInfoQuery.setOrderBy("m.create_time desc");
        if (indexType != null) {
            musicInfoQuery.setPageSize(PageSize.SIZE12.getSize());
        } else {
            musicInfoQuery.setPageSize(PageSize.SIZE20.getSize());
        }
        TokenUserInfoDTO tokenUserInfoDTO = getTokenUserInfo(null);
        musicInfoQuery.setCurrentUserId(tokenUserInfoDTO == null ? null : tokenUserInfoDTO.getUserId());
        musicInfoQuery.setPageNo(pageNo);
        return getSuccessResponseVO(musicInfoService.findListByPage(musicInfoQuery));
    }

    @RequestMapping("/musicDetail")
    public ResponseVO musicDetail(@NotEmpty String musicId) {
        MusicInfo musicInfo = musicInfoService.getMusicInfoByMusicId(musicId);
        TokenUserInfoDTO tokenUserInfoDTO = getTokenUserInfo(null);
        if (tokenUserInfoDTO != null) {
            MusicInfoAction action = musicInfoActionService.getMusicInfoActionByMusicIdAndUserId(musicId, tokenUserInfoDTO.getUserId());
            musicInfo.setDoGood(action != null);
        }
        return getSuccessResponseVO(musicInfo);
    }


    @RequestMapping("/doGood")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO doGood(@NotEmpty String musicId) {
        musicInfoActionService.doGood(musicId, getTokenUserInfo(null).getUserId());
        return getSuccessResponseVO(null);
    }

    @RequestMapping("/updatePlayCount")
    public ResponseVO updatePlayCount(@NotEmpty String musicId) {
        musicInfoService.updateMusicCount(musicId);
        return getSuccessResponseVO(null);
    }

    @RequestMapping("/getCreation")
    public ResponseVO getCreation(@NotEmpty String creationId) {
        MusicCreation musicCreation = musicCreationService.getMusicCreationByCreationId(creationId);
        return getSuccessResponseVO(musicCreation);
    }


    @Resource
    private FileUtils fileUtils;

    @RequestMapping("/spiderMp3")
    public ResponseVO spiderMp3(String itemId) {
        String commonJson = "{\"app_id\":\"tempolor\",\"app\":\"web_main_oversea\",\"business_type\":\"tianpuyue\",\"ve\":\"0.8.0\",\"sv\":\"alpha/beta/release\"," +
                "\"ver_code\":800,\"entry\":\"web_main\",\"lang\":\"chinese\",\"la\":\"zh-CN\",\"fr\":\"web\",\"di\":\"22d95885cc43bf163d716822038259e9\"," + "\"pf" +
                "\":\"100\",\"mi\":\"Windows\",\"biz\":378,\"utdid\":\"22d95885cc43bf163d716822038259e9\",\"ts\":1755687797214," + "\"service_ticket" +
                "\":\"dTBewbYTVakTcZ8VRh0od2IbTMCVgAiPJdP3AOpnsk4yqlqb3tHzvnDLQ/uazaybfVE=\",\"ucid\":\"2022814977\",\"user_id\":\"2022814977\"," + "\"user_type" +
                "\":\"google\",\"member_level\":1,\"is_visitor\":0,\"ip\":\"116.211.100.254\"}";

        Map<String, Object> requestParams = JsonUtils.convertJson2Obj(commonJson, Map.class);
        requestParams.put("ts", System.currentTimeMillis());
        Map<String, Object> params = new HashMap<>();
        params.put("itemId", itemId);
        params.put("requestParams", requestParams);
        String json = OKHttpUtils.postRequest4Json("https://www.tianpuyue.cn/api/httpSolo/t2mQueryDetail", null, JsonUtils.convertObj2Json(params));

        JSONObject jsonObject = (JSONObject) JSONPath.eval(json, "$.data.detail.aiGenerateMusicDTO.dtmExtVo");

        String audioPath = (String) JSONPath.eval(json, "$.data.detail.aiGenerateMusicDTO.ossId");
        String songName = (String) jsonObject.get("songName");
        String cover = (String) jsonObject.get("cover");
        String duration = (String) ((JSONObject) jsonObject.get("musicParamLabel")).get("duration");

        String lrcTimestamp = (String) jsonObject.get("lrcTimestamp");
        List<Map> resultMapList = new ArrayList<>();
        if (lrcTimestamp != null) {
            List<Map> mapList = JsonUtils.convertJsonArray2List(lrcTimestamp, Map.class);
            for (Map map : mapList) {
                Map<String, Object> temp = new HashMap<>();
                temp.put("start", map.get("onset"));
                temp.put("end", map.get("offset"));
                temp.put("text", map.get("lyrics"));
                resultMapList.add(temp);
            }
        }

        MusicCreation musicCreation = new MusicCreation();
        musicCreation.setCreationId(StringTools.getRandomString(15));
        musicCreation.setCreateTime(new Date());
        musicCreation.setUserId("874391377680");
        musicCreation.setPrompt(String.valueOf(jsonObject.get("description")));
        musicCreation.setModel("V3.5");
        musicCreation.setMusicType(0);
        musicCreationService.add(musicCreation);

        audioPath = fileUtils.downloadFile(audioPath, Constants.AUDIO_SUFFIX);
        cover = fileUtils.downloadFile(cover.replace("http", "https"), ".png");
        MusicInfo musicInfo = new MusicInfo();
        musicInfo.setCreationId(musicCreation.getCreationId());
        musicInfo.setMusicId(StringTools.getRandomNumber(12));
        musicInfo.setUserId("874391377680");
        musicInfo.setPlayCount(0);
        musicInfo.setMusicTitle(songName);
        musicInfo.setCover(cover);
        musicInfo.setAudioPath(audioPath);
        musicInfo.setDuration(Integer.parseInt(duration));
        musicInfo.setLyrics(JsonUtils.convertObj2Json(resultMapList));
        musicInfo.setPlayCount(0);
        musicInfo.setGoodCount(0);
        musicInfo.setCommendType(1);
        musicInfo.setCreateTime(new Date());
        musicInfo.setTaskId(itemId);
        musicInfo.setMusicStatus(1);
        musicInfoService.add(musicInfo);
        return getSuccessResponseVO(null);
    }
}