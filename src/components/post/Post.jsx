import { useState, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './post.scss';
import defaultAvatar from '../../assets/defaultAvatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAmericas, faUserGroup, faLock, faEllipsis, faThumbsUp, faMessage } from '@fortawesome/free-solid-svg-icons';
import { Spin } from 'react-cssfx-loading/lib';
import postAPI from '../../services/postAPI';
import commentAPI from '../../services/commentAPI';
import ParentComment from '../comment_component/parent_comment/ParentComment';
import CommentBar from '../comment_component/comment_nav/CommentBar';
import { useNavigate } from 'react-router-dom';
import timeFormat from '../../utils/timeFormat';
import { addParentComment } from '../../redux/commentSlice';

function Post({ post }) {
    const $ = document.querySelector.bind(document)
    const themeMode = useSelector(state => state.auth.themeMode) === 'dark' ? ' dark' : ''
    const currentUser = useSelector(state => state.auth.login.user.userInformation)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const userId = post.userId
    const like = post.like
    const mode = post.mode
    const comment = post.comment
    const postId = post.id
    const postCreatedAt = post.createdAt
    const authorFullName = `${post.firstName+' '+post.lastName}`
    const authorAvatar = post.avatar
    const textContent = post.textContent
    const imageContent = post.imageContent

    const timeAgo = timeFormat.timeAgoForPost(postCreatedAt)
    const likeArr = like ? JSON.parse(like) : []
    const likeArrLength = likeArr ? likeArr.length : null
    const [likeIcon, setLikeIcon] = useState(likeStatus())
    const [likeDesc, setLikeDesc] = useState(likeStatus())
    const [numberLike, setDescLikeNum] = useState(likeNumStatus())
    const [loadingParentComment, setLoadingParentComment] = useState(false)
    const commentVision = useRef()
    const allParentComment = JSON.parse(useSelector(state => state.comment.parentComment))
    const parentCommentArr = allParentComment ? allParentComment.filter(comment => (comment.postId)*1 === postId) : null
    const offSet = useRef(parentCommentArr ? parentCommentArr.length : 0)

    async function handleShowParentComment() {
        try {
            setLoadingParentComment(true)
            let res = await commentAPI.getComment({ postId: postId, offSet: offSet.current })
            if (res.data.errCode === 0) {
                setLoadingParentComment(false)
                const parentComment = res.data.parentComment
                commentVision.current 
                    ? commentVision.current = [ ...(commentVision.current), ...parentComment ]
                    : commentVision.current = parentComment
                offSet.current = commentVision.current.length
                dispatch(addParentComment(parentComment))
            }
        } catch (error) {
            console.log(error)
        }
    }
    function likeNumStatus() {
        if (like) {
            if (likeArrLength === 1) {
                if (likeArr[0] === currentUser.userId) {
                    return `${currentUser.firstName+' '+currentUser.lastName}`
                }
                return 1
            } else {
                if (likeArr.includes(currentUser.userId)) {
                    return `Bạn và `+(likeArrLength - 1)+` người khác`
                }
                return likeArrLength
            }
        }
        return 0
    }
    function likeStatus() {
        if (like) { 
            if (likeArr.includes(currentUser.userId)) {
                return 'liked'
            }
            return null
        }
        return null    
    }
    async function handleLikePost() {
        try {
            const updateLike = {
                id: postId,
                like: currentUser.userId
            }
            const res = await postAPI.updatePost(updateLike)
            if (res.data.errCode === 0) {
                if (likeIcon === null && likeDesc === null) {
                    setLikeIcon('liked')
                    setLikeDesc('liked')
                    setDescLikeNum(() => {
                        if (likeArrLength === 0) {
                            return currentUser.firstName+" "+currentUser.lastName
                        } else {
                            if (likeArr.includes(currentUser.userId)) {
                                if (likeArrLength === 1) {
                                    return `${currentUser.firstName+' '+currentUser.lastName}`
                                }
                                return `Bạn và `+ (likeArrLength - 1) +` người khác`
                            }
                            return `Bạn và `+ (likeArrLength) +` người khác`
                        }
                    })
                } else {
                    setLikeIcon(null)
                    setLikeDesc(null)
                    setDescLikeNum(() => {
                        if (likeArrLength === 0) {
                            return 0
                        } else {
                            if (likeArr.includes(currentUser.userId)) {
                                return likeArrLength - 1
                            }
                            return likeArrLength
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={"post-wrapper"+themeMode}>
            <div className="post-top">
                <div 
                    className="post-top-left"
                    onClick={() => {navigate(`/${userId}`)}}
                >
                    <img src={authorAvatar ? authorAvatar : defaultAvatar} alt="" />
                </div>
                <div className="post-top-center">
                    <span 
                        className="post-author" onClick={() => {navigate(`/${userId}`)}}
                    >{authorFullName}</span>
                    <div className="time-info-wrapper">
                        <span className="time-posting">{timeAgo}</span>
                        <span className="dot">.</span>
                        <div className="posting-mode-wrapper">
                        {    
                            mode && mode === "public"
                                ? <FontAwesomeIcon icon={faEarthAmericas} className="mode-icon"/>
                                : mode === "friend"
                                    ? <FontAwesomeIcon icon={faUserGroup} className="mode-icon friend"/>       
                                    : <FontAwesomeIcon icon={faLock} className="mode-icon"/>                
                        }         
                        </div>
                    </div>
                </div>
                <div className="post-top-right">
                    <div className="extra-wrapper-icon">
                        <FontAwesomeIcon icon={faEllipsis} className="dot-icon"/>
                    </div>
                </div>
            </div>
            <div className="post-content">
                <div className="caption-wrapper">
                    <span className="caption">{textContent}</span>
                </div>
                {
                    imageContent && <img src={imageContent} alt="" className="content-img" loading="eager"/>
                }
            </div>
            <div className="post-bottom">
                <div className="interactive-wrapper">
                    <div className="interactive-number">
                    {
                        (numberLike !== 0) &&
                        <div className="interactive-like">
                            <div className="wrapper-like-icon">
                                <FontAwesomeIcon icon={faThumbsUp} className="like-icon"/>
                            </div>
                            <div className="wrapper-like-num">
                                <span className="like-num">{numberLike}</span>
                            </div>
                        </div>

                    }
                        <div className="interactive-comment">
                            <span className="comment-num">{comment ? `${comment.totalComment} bình luận` : ''}</span>
                        </div>
                    </div>
                    <div className="wrapper-button-interactive disable-select">
                        <div className="like-btn" onClick={handleLikePost}>
                            <FontAwesomeIcon icon={faThumbsUp} className={"like-icon "+likeIcon} id="like-icon"/>
                            <span className={"like-desc "+likeDesc}>Thích</span>
                        </div>
                        <div className="comment-btn"
                            onClick={() => {
                                const textChat = $(`div[id="text-comment-content-post${postId}"]`)
                                textChat.focus()
                                textChat.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }}
                        >
                            <FontAwesomeIcon icon={faMessage} className="comment-icon"/>
                            <span>Bình luận</span>
                        </div>
                    </div>
                </div>
                <div className="comment-wrapper">
                    <div className="wrapper-cmt-parent">
                    {
                        parentCommentArr?.map((comment) => {
                            return (
                                <ParentComment key={comment.id} postId={postId} parentComment={comment} />  
                            )
                        })
                    }
                    </div>
                    {
                        (comment && offSet.current < comment.totalParentComment) &&
                        <div className="comment-number">
                            <span 
                                className="comment-read-more disable-select" onMouseDown={handleShowParentComment}
                            >
                                {
                                    comment.totalParentComment > offSet.current
                                        ? `Xem ${comment.totalParentComment - offSet.current} bình luận`
                                        : ''
                                }
                                {
                                    loadingParentComment
                                    &&
                                    <div className="wrap-loading-comment-icon">
                                        <Spin color={themeMode === ' dark' ? '#b0b3b8' : '#616161'} />
                                    </div>
                                }
                            </span>
                            {
                                (0 < offSet.current && offSet.current < comment.totalParentComment) && 
                                <span className="comment-number-remain">{offSet.current+"/"+comment.totalParentComment}</span>
                            }
                        </div>
                    }
                </div>
                <div id={"comment-bar-post-"+postId} className="wrap-comment-navbar">
                    <CommentBar id={postId} commentBarFor='post' />
                </div>
            </div>
        </div>    
    )
}

export default memo(Post);
