import React, { useState, useEffect } from 'react';
import axios from "../../utils/axios";
import './StudentInquiryBoard.css';  // 스타일 파일 불러오기

const StudentInquiryBoard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [curriculumName, setCurriculumName] = useState('');
    const [curriculumTh, setCurriculumTh] = useState('');
    const [status, setStatus] = useState('');
    const [hasSearched, setHasSearched] = useState(false); // 조회 여부 상태 추가

    const fetchInquiries = async () => {
        try {
            const response = await axios.get("/managers/students-inquiries");
            if (Array.isArray(response.data)) {
                setInquiries(response.data);
            } else {
                setInquiries([]);
            }
        } catch (e) {
            console.error("문의내역을 불러올 수 없음", e);
        } finally {
            setLoading(false);
        }
    }

    // FullName 교육과정명 => 변환
    const transformCurriculumName = (curriculumName) => {
        switch (curriculumName) {
            case "네이버 클라우드 데브옵스 과정":
                return "네이버 데브옵스";
            case "AWS 클라우드 자바 웹 개발자 과정":
                return "AWS 자바 웹";
            default:
                return "curriculumName";
        }
    }

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleFilter = () => {
        const filtered = inquiries.filter((inquiry) => {
            const curriculumMatches =
                !curriculumName || inquiry.curriculumName === curriculumName;
            const curriculumThMatches =
                !curriculumTh || inquiry.curriculumTh.toString() === curriculumTh;
            const statusMatches =
                !status || (status === "답변 완료" && inquiry.response !== null) ||
                (status === "미답변" && inquiry.response === null);

            return curriculumMatches && curriculumThMatches && statusMatches;
        });
        setFilteredInquiries(filtered);
        setHasSearched(true); // 조회 버튼 클릭 시 조회 상태 변경
    };

    // 필터링된 문의 내역을 두 개의 컬럼으로 나누는 함수
    const splitInquiries = (inquiries) => {
        const midIndex = Math.ceil(inquiries.length / 2);
        const leftColumn = inquiries.slice(0, midIndex);
        const rightColumn = inquiries.slice(midIndex);
        return { leftColumn, rightColumn };
    };

    const { leftColumn, rightColumn } = splitInquiries(filteredInquiries);

    return (
        <div className="student-contact">
          <h2>학생 문의</h2>
            <div className="filter-container">
              <img
                src="/"
                alt="Naver"
                className="filter-logo"
                onClick={() => setCurriculumName("네이버 클라우드 데브옵스 과정")}
              />
              <img
                src="/"
                alt="AWS"
                className="filter-logo"
                onClick={() => setCurriculumName("AWS 클라우드 자바 웹 개발자 과정")}
              />
                <select
                    className="batch-filter"
                    value={curriculumTh}
                    onChange={(e) => setCurriculumTh(e.target.value)}
                >
                  <option value="">기수 선택</option>
                    {Array.from(new Set(inquiries.map(inquiry => inquiry.curriculumTh)))
                      .map((th, index) => (
                        <option key={`${th}-${index}`} value={th}>
                          {th}기
                        </option>
                      ))}
                </select>
                <select
                    className="status-filter"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">전체</option>
                    <option value="답변 완료">답변 완료</option>
                    <option value="미답변">미답변</option>
                </select>
                <button onClick={handleFilter}>조회</button>
            </div>

            {/* 조회 버튼을 클릭한 이후에만 결과를 표시 */}
            {hasSearched ? (
                filteredInquiries.length === 0 ? (
                    <div className="no-inquiries-message">
                        문의 내역이 없습니다.
                    </div>
                ) : (
                    <div className="inquiries-grid">
                        <div className="inquiries-column">
                            {leftColumn.map((inquiry, index) => (
                                <div
                                    key={index}
                                    className={`inquiry-card ${inquiry.response ? "answered" : "unanswered"}`}
                                >
                                    <div className="inquiry-header">
                                        <span className="inquiry-batch">{inquiry.curriculumTh}기</span>
                                        <span className="inquiry-course">{transformCurriculumName(inquiry.curriculumName)}</span>
                                        <span className="inquiry-instructor">{inquiry.name}</span>
                                        <span className="inquiry-date">{inquiry.createdDate}</span>
                                    </div>
                                    <div className="inquiry-footer">
                                        <p className="inquiry-question">{inquiry.title}</p>
                                        <span className={`inquiry-status ${inquiry.response ? "status-answered" : "status-unanswered"}`}>
                                            {inquiry.response ? "답변 완료" : "미답변"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="inquiries-column">
                            {rightColumn.map((inquiry, index) => (
                                <div
                                    key={index}
                                    className={`inquiry-card ${inquiry.response ? "answered" : "unanswered"}`}
                                >
                                    <div className="inquiry-header">
                                        <span className="inquiry-batch">{inquiry.curriculumTh}기</span>
                                        <span className="inquiry-course">{transformCurriculumName(inquiry.curriculumName)}</span>
                                        <span className="inquiry-instructor">{inquiry.name}</span>
                                        <span className="inquiry-date">{inquiry.createdDate}</span>
                                    </div>
                                    <div className="inquiry-footer">
                                        <p className="inquiry-question">{inquiry.title}</p>
                                        <span className={`inquiry-status ${inquiry.response ? "status-answered" : "status-unanswered"}`}>
                                            {inquiry.response ? "답변 완료" : "미답변"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="no-inquiries-message">
                    조회할 항목을 선택 후 조회 버튼을 눌러 주세요.
                </div>
            )}
        </div>
    );
};

export default StudentInquiryBoard;
